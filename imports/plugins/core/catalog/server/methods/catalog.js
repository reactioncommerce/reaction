import { Meteor } from "meteor/meteor";
import { Random } from "meteor/random";
import { check, Match } from "meteor/check";
import { uniq, uniqBy } from "lodash";
import { Catalog as CatalogCollection, Products } from "/lib/collections";
import { Logger, Reaction } from "/server/api";
import { Media } from "/imports/plugins/core/files/server";
import { ProductRevision as Catalog } from "/imports/plugins/core/revisions/server/hooks";

/**
 * @method isSoldOut
 * @summary We are to stop accepting new orders if product is marked as `isSoldOut`.
 * @memberof Catalog
 * @param {Array} variants - Array with top-level variants
 * @return {Boolean} true if summary product quantity is zero.
 */
export function isSoldOut(variants) {
  return variants.every((variant) => {
    if (variant.inventoryManagement) {
      return Catalog.getVariantQuantity(variant) <= 0;
    }
    return false;
  });
}

/**
 * @method isLowQuantity
 * @summary If at least one of the variants is less than the threshold, then function returns `true`
 * @memberof Catalog
 * @param {Array} variants - array of child variants
 * @return {boolean} low quantity or not
 */
export function isLowQuantity(variants) {
  return variants.some((variant) => {
    const quantity = Catalog.getVariantQuantity(variant);
    // we need to keep an eye on `inventoryPolicy` too and qty > 0
    if (variant.inventoryManagement && variant.inventoryPolicy && quantity) {
      return quantity <= variant.lowInventoryWarningThreshold;
    }
    return false;
  });
}

/**
 * @method isBackorder
 * @summary Is products variants is still available to be ordered after summary variants quantity is zero
 * @memberof Catalog
 * @param {Array} variants - array with variant objects
 * @return {boolean} is backorder allowed or not for a product
 */
export function isBackorder(variants) {
  return variants.every((variant) => !variant.inventoryPolicy && variant.inventoryManagement &&
    variant.inventoryQuantity === 0);
}

export function getCatalogPositions(productPositions) {
  return Object.keys(productPositions).map((tagId) => {
    const info = productPositions[tagId];
    return {
      displayWeight: info.weight,
      isPinned: !!info.pinned,
      position: info.position || 1,
      tagId,
      updatedAt: info.updatedAt
    };
  });
}

/**
 * @method publishProductToCatalog
 * @summary Publish a product to the Catalog
 * @memberof Catalog
 * @param {Object} product - A product object
 * @return {boolean} true on successful publish, false if publish was unsuccessful
 */
async function publishProductToCatalog(product) {
  if (!product) {
    Logger.info("Cannot publish product to catalog");
    return false;
  }

  // Get Media for the product
  const mediaArray = await Media.find({
    "metadata.productId": product._id,
    "metadata.toGrid": 1,
    "metadata.workflow": { $nin: ["archived", "unpublished"] }
  }, {
    sort: { "metadata.priority": 1, "uploadedAt": 1 }
  });

  // Denormalize media
  const catalogProductMedia = mediaArray
    .map((media) => {
      const { metadata } = media;
      const { toGrid, priority, productId, variantId } = metadata || {};

      return {
        priority,
        toGrid,
        productId,
        variantId,
        URLs: {
          large: `${media.url({ store: "large" })}`,
          medium: `${media.url({ store: "medium" })}`,
          original: `${media.url({ store: "image" })}`,
          small: `${media.url({ store: "small" })}`,
          thumbnail: `${media.url({ store: "thumbnail" })}`
        }
      };
    })
    .sort((a, b) => a.priority - b.priority);

  const primaryImage = catalogProductMedia.find(({ toGrid }) => toGrid === 1) || null;

  // Get all variants of the product and denormalize them into an array on the CatalogProduct
  const variants = Products.find({ ancestors: product._id }).fetch();

  const catalogProductVariants = variants
    // We filter out deleted or non-visible variants when publishing to catalog.
    // We don't do this for top-level products.
    .filter((variant) => !variant.isDeleted && variant.isVisible)

    // We want to explicitly map everything so that new properties added to variant are not published to a catalog unless we want them
    .map((variant) => ({
      _id: variant._id,
      ancestorIds: variant.ancestors || [],
      barcode: variant.barcode,
      compareAtPrice: variant.compareAtPrice,
      createdAt: variant.createdAt,
      height: variant.height,
      index: variant.index || 0,
      inventoryManagement: !!variant.inventoryManagement,
      inventoryPolicy: !!variant.inventoryPolicy,
      isLowQuantity: !!variant.isLowQuantity,
      isSoldOut: !!variant.isSoldOut,
      isTaxable: !!variant.taxable,
      length: variant.length,
      lowInventoryWarningThreshold: variant.lowInventoryWarningThreshold,
      metafields: variant.metafields,
      minOrderQuantity: variant.minOrderQuantity,
      optionTitle: variant.optionTitle,
      originCountry: variant.originCountry,
      price: variant.price,
      shopId: variant.shopId,
      sku: variant.sku,
      taxCode: variant.taxCode,
      taxDescription: variant.taxDescription,
      title: variant.title,
      updatedAt: variant.updatedAt || variant.createdAt,
      // The _id prop could change whereas this should always point back to the source variant in Products collection
      variantId: variant._id,
      weight: variant.weight,
      width: variant.width
    }));

  const catalogProduct = {
    // We want to explicitly map everything so that new properties added to product are not published to a catalog unless we want them
    _id: product._id,
    barcode: product.barcode,
    compareAtPrice: product.compareAtPrice,
    createdAt: product.createdAt,
    description: product.description,
    height: product.height,
    isBackorder: isBackorder(catalogProductVariants),
    isDeleted: !!product.isDeleted,
    isLowQuantity: isLowQuantity(catalogProductVariants),
    isSoldOut: isSoldOut(catalogProductVariants),
    isTaxable: !!product.taxable,
    isVisible: !!product.isVisible,
    length: product.length,
    lowInventoryWarningThreshold: product.lowInventoryWarningThreshold,
    media: catalogProductMedia,
    metafields: product.metafields,
    metaDescription: product.metaDescription,
    minOrderQuantity: product.minOrderQuantity,
    originCountry: product.originCountry,
    pageTitle: product.pageTitle,
    parcel: product.parcel,
    price: product.price,
    primaryImage,
    // The _id prop could change whereas this should always point back to the source product in Products collection
    productId: product._id,
    productType: product.productType,
    requiresShipping: !!product.requiresShipping,
    shopId: product.shopId,
    sku: product.sku,
    slug: product.handle,
    socialMetadata: [
      { service: "twitter", message: product.twitterMsg },
      { service: "facebook", message: product.facebookMsg },
      { service: "googleplus", message: product.googleplusMsg },
      { service: "pinterest", message: product.pinterestMsg }
    ],
    tagIds: product.hashtags,
    taxCode: product.taxCode,
    taxDescription: product.taxDescription,
    title: product.title,
    type: "product-simple",
    updatedAt: product.updatedAt || product.createdAt,
    variants: catalogProductVariants,
    vendor: product.vendor,
    weight: product.weight,
    width: product.width
  };

  // Move `positions` onto the CatalogItem instead of the product, and switch from map to array
  const positions = getCatalogPositions(product.positions);

  // Insert/update catalog document
  const result = CatalogCollection.upsert({
    "product.productId": product.productId
  }, {
    $set: {
      positions,
      product: catalogProduct,
      shopId: product.shopId,
      updatedAt: new Date()
    },
    $setOnInsert: {
      _id: Random.id(),
      createdAt: new Date()
    }
  });

  return result && result.numberAffected === 1;
}

/**
 * @method publishProductIdToCatalog
 * @summary Publish a product to the Catalog by ID
 * @memberof Catalog
 * @param {string} productId - A string product id
 * @return {boolean} true on successful publish, false if publish was unsuccessful
 */
export async function publishProductIdToCatalog(productId) {
  check(productId, String);

  // Find the product by id
  let product = Products.findOne({ _id: productId });

  // Stop if a product could not be found
  if (!product) {
    Logger.info("Cannot publish product to catalog");
    return false;
  }

  // If the product has ancestors, then find the top product document
  if (Array.isArray(product.ancestors) && product.ancestors.length) {
    product = Products.findOne({
      _id: product.ancestors[0]
    });
  }

  return publishProductToCatalog(product);
}

/**
 * @method publishProductsToCatalog
 * @summary Publish one or more products to the Catalog
 * @memberof Catalog
 * @param {string|array} productIds - A string product id or an array of product ids
 * @return {boolean} true on successful publish for all documents, false if one ore more fail to publish
 */
export function publishProductsToCatalog(productIds) {
  check(productIds, [String]);

  let products = productIds.map((productId) => {
    const product = Products.findOne({ _id: productId });

    // Stop if a product could not be found
    if (!product) {
      throw new Meteor.Error("not-found", `No product found with ID ${productId}`);
    }

    if (!Array.isArray(product.ancestors) || product.ancestors.length === 0) {
      return product;
    }

    return Products.findOne({
      _id: product.ancestors[0]
    });
  });

  // Remove duplicate top-level products. This could happen if a variant ID is included
  // as well as its parent ID.
  products = uniqBy(products, "_id");

  const promises = products.map((product) => publishProductToCatalog(product));
  const results = Promise.all(promises);
  return results.every((result) => result);
}

/**
 * @method publishProductInventoryAdjustments
 * @summary Publish inventory updates for a single product to the Catalog
 * @memberof Catalog
 * @param {string} productId - A string product id
 * @return {boolean} true on success, false on failure
 */
export function publishProductInventoryAdjustments(productId) {
  check(productId, Match.OneOf(String, Array));

  const catalogProduct = CatalogCollection.findOne({
    _id: productId
  });

  if (!catalogProduct) {
    Logger.info("Cannot publish inventory changes to catalog product");
    return false;
  }

  const variants = Products.find({
    ancestors: {
      $in: [productId]
    }
  }).fetch();

  const update = {
    isSoldOut: isSoldOut(variants),
    isBackorder: isBackorder(variants),
    isLowQuantity: isLowQuantity(variants)
  };

  // Only apply changes of one these fields have changed
  if (
    update.isSoldOut !== catalogProduct.isSoldOut ||
    update.isBackorder !== catalogProduct.isBackorder ||
    update.isLowQuantity !== catalogProduct.isLowQuantity
  ) {
    const result = CatalogCollection.update({
      _id: productId
    }, {
      $set: update
    });

    return result;
  }

  return false;
}

Meteor.methods({
  "catalog/publish/products": (productIds) => {
    check(productIds, [String]);

    // Ensure user has createProduct permission for active shop
    if (!Reaction.hasPermission("createProduct")) {
      Logger.error("Access Denied");
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    // Find all products
    const products = Products.find({
      _id: { $in: productIds }
    }, { _id: 1, shopId: 1 }).fetch();

    if (products.length !== productIds.length) {
      throw new Meteor.Error("not-found", "Some products not found");
    }

    // Only allow users to publish products for shops they permissions to createProductsFor
    // If the user can createProducts on the main shop, they can publish products for all shops to the catalog.
    const canUpdatePrimaryShopProducts = Reaction.hasPermission("createProduct", this.userId, Reaction.getPrimaryShopId());

    if (!canUpdatePrimaryShopProducts) {
      const uniqueShopIds = uniq(products.map((product) => product.shopId));
      uniqueShopIds.forEach((shopId) => {
        if (!Reaction.hasPermission("createProduct", this.userId, shopId)) {
          throw new Meteor.Error("access-denied", "Access Denied");
        }
      });
    }

    const success = publishProductsToCatalog(productIds);

    if (!success) {
      Logger.error("Some Products could not be published to the Catalog.");
      throw new Meteor.Error("server-error", "Some Products could not be published to the Catalog.");
    }

    return true;
  }
});
