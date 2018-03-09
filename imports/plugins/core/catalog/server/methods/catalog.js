import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Products, Catalog as CatalogCollection } from "/lib/collections";
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

/**
 * @method publishProductToCatalog
 * @summary Publish a product to the Catalog
 * @memberof Catalog
 * @param {string} productId - A string product id
 * @return {boolean} true on successful publish, false if publish was unsuccessful
 */
export async function publishProductToCatalog(productId) {
  check(productId, String);

  // Find the product by id
  let product = Products.findOne({
    $or: [
      { _id: productId },
      { ancestors: { $in: [productId] } }
    ]
  });

  // Stop if a product could not be found
  if (!product) {
    Logger.info("Cannot publish product to catalog");
    return false;
  }

  // If the product has ancestors, then find to top product document
  if (Array.isArray(product.ancestors) && product.ancestors.length) {
    product = Products.findOne({
      _id: product.ancestors[0]
    });
  }

  // Get variants of the product
  const variants = Products.find({
    ancestors: {
      $in: [productId]
    }
  }).fetch();

  // Get Media for the product
  const mediaArray = await Media.find({
    "metadata.productId": productId,
    "metadata.toGrid": 1,
    "metadata.workflow": { $nin: ["archived", "unpublished"] }
  }, {
    sort: { "metadata.priority": 1, "uploadedAt": 1 }
  });

  // Denormalize media
  const productMedia = mediaArray.map((media) => ({
    metadata: media.metadata,
    thumbnail: `${media.url({ store: "thumbnail" })}`,
    small: `${media.url({ store: "small" })}`,
    medium: `${media.url({ store: "medium" })}`,
    large: `${media.url({ store: "large" })}`,
    image: `${media.url({ store: "image" })}`
  }));

  // Denormalize product fields
  product.media = productMedia;
  product.type = "product-simple";
  product.isSoldOut = isSoldOut(variants);
  product.isBackorder = isBackorder(variants);
  product.isLowQuantity = isLowQuantity(variants);
  product.variants = variants.map((variant) => {
    const { inventoryQuantity, ...v } = variant;
    return v;
  });

  // Insert/update catalog document
  const result = CatalogCollection.upsert({
    _id: productId
  }, {
    $set: product
  });

  return result && result.numberAffected === 1;
}

/**
 * @method publishProductsToCatalog
 * @summary Publish one or more products to the Catalog
 * @memberof Catalog
 * @param {string|array} productIds - A string product id or an array of product ids
 * @return {boolean} true on successful publish for all documents, false if one ore more fail to publish
 */
export function publishProductsToCatalog(productIds) {
  check(productIds, Match.OneOf(String, Array));

  let ids = productIds;
  if (typeof ids === "string") {
    ids = [productIds];
  }

  return ids.every(async (productId) => await publishProductToCatalog(productId));
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
    check(productIds, Match.OneOf(String, Array));

    // Ensure user has createProduct permission for active shop
    if (!Reaction.hasPermission("createProduct")) {
      Logger.error("Access Denied");
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    // Convert productIds if it's a string
    let ids = productIds;
    if (typeof ids === "string") {
      ids = [productIds];
    }

    // Find all products
    const productsToPublish = Products.find({
      _id: { $in: ids }
    }).fetch();

    if (Array.isArray(productsToPublish)) {
      const canUpdatePrimaryShopProducts = Reaction.hasPermission("createProduct", this.userId, Reaction.getPrimaryShopId());

      const publisableProductIds = productsToPublish
        // Only allow users to publish products for shops they permissions to createProductsFor
        // If the user can createProducts on the main shop, they can publish products for all shops to the catalog.
        .filter((product) => Reaction.hasPermission("createProduct", this.userId, product.shopId) || canUpdatePrimaryShopProducts)
        .map((product) => product._id);

      const success = publishProductsToCatalog(publisableProductIds);

      if (!success) {
        Logger.error("Some Products could not be published to the Catalog.");
        throw new Meteor.Error("server-error", "Some Products could not be published to the Catalog.");
      }

      return true;
    }

    return false;
  }
});
