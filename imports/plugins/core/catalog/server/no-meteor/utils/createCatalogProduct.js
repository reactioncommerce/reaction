import Logger from "@reactioncommerce/logger";
import canBackorder from "./canBackorder";
import getCatalogProductMedia from "./getCatalogProductMedia";
import isBackorder from "/imports/plugins/core/inventory/server/no-meteor/utils/isBackorder";
import isLowQuantity from "/imports/plugins/core/inventory/server/no-meteor/utils/isLowQuantity";
import isSoldOut from "/imports/plugins/core/inventory/server/no-meteor/utils/isSoldOut";

/**
 * @method
 * @summary Converts a variant Product document into the catalog schema for variants
 * @param {Object} variant The variant from Products collection
 * @param {Object} variantMedia Media for this specific variant
 * @param {Object} variantInventory Inventory flags for this variant
 * @private
 * @returns {Object} The transformed variant
 */
export function xformVariant(variant, variantMedia, variantInventory) {
  const primaryImage = variantMedia.find(({ toGrid }) => toGrid === 1) || null;

  return {
    _id: variant._id,
    barcode: variant.barcode,
    canBackorder: variantInventory.canBackorder,
    createdAt: variant.createdAt || new Date(),
    height: variant.height,
    index: variant.index || 0,
    inventoryAvailableToSell: variantInventory.inventoryAvailableToSell || 0,
    inventoryInStock: variantInventory.inventoryInStock || 0,
    inventoryManagement: !!variant.inventoryManagement,
    inventoryPolicy: !!variant.inventoryPolicy,
    isBackorder: variantInventory.isBackorder,
    isLowQuantity: variantInventory.isLowQuantity,
    isSoldOut: variantInventory.isSoldOut,
    length: variant.length,
    lowInventoryWarningThreshold: variant.lowInventoryWarningThreshold,
    media: variantMedia,
    metafields: variant.metafields,
    minOrderQuantity: variant.minOrderQuantity,
    optionTitle: variant.optionTitle,
    originCountry: variant.originCountry,
    primaryImage,
    shopId: variant.shopId,
    sku: variant.sku,
    title: variant.title,
    updatedAt: variant.updatedAt || variant.createdAt || new Date(),
    // The _id prop could change whereas this should always point back to the source variant in Products collection
    variantId: variant._id,
    weight: variant.weight,
    width: variant.width
  };
}

/**
 * @summary The core function for transforming a Product to a CatalogProduct
 * @param {Object} data Data obj
 * @param {Object} data.collections Map of MongoDB collections by name
 * @param {Object} data.product The source product
 * @param {Object[]} data.variants The Product documents for all variants of this product
 * @returns {Object} The CatalogProduct document
 */
export async function xformProduct({ collections, product, variants }) {
  const catalogProductMedia = await getCatalogProductMedia(product._id, collections);
  const primaryImage = catalogProductMedia.find(({ toGrid }) => toGrid === 1) || null;

  const topVariants = [];
  const options = new Map();

  variants.forEach((variant) => {
    if (variant.ancestors.length === 2) {
      const parentId = variant.ancestors[1];
      if (options.has(parentId)) {
        options.get(parentId).push(variant);
      } else {
        options.set(parentId, [variant]);
      }
    } else {
      topVariants.push(variant);
    }
  });

  const catalogProductVariants = topVariants
    // We want to explicitly map everything so that new properties added to variant are not published to a catalog unless we want them
    .map((variant) => {
      const variantOptions = options.get(variant._id);
      let variantInventory;
      if (variantOptions) {
        variantInventory = {
          canBackorder: canBackorder(variantOptions),
          inventoryAvailableToSell: variant.inventoryAvailableToSell || 0,
          inventoryInStock: variant.inventoryInStock || 0,
          isBackorder: isBackorder(variantOptions),
          isLowQuantity: isLowQuantity(variantOptions),
          isSoldOut: isSoldOut(variantOptions)
        };
      } else {
        variantInventory = {
          canBackorder: canBackorder([variant]),
          inventoryAvailableToSell: variant.inventoryAvailableToSell || 0,
          inventoryInStock: variant.inventoryInStock || 0,
          isBackorder: isBackorder([variant]),
          isLowQuantity: isLowQuantity([variant]),
          isSoldOut: isSoldOut([variant])
        };
      }

      const variantMedia = catalogProductMedia.filter((media) => media.variantId === variant._id);

      const newVariant = xformVariant(variant, variantMedia, variantInventory);

      if (variantOptions) {
        newVariant.options = variantOptions.map((option) => {
          const optionMedia = catalogProductMedia.filter((media) => media.variantId === option._id);
          const optionInventory = {
            canBackorder: canBackorder([option]),
            inventoryAvailableToSell: option.inventoryAvailableToSell,
            inventoryInStock: option.inventoryInStock,
            isBackorder: isBackorder([option]),
            isLowQuantity: isLowQuantity([option]),
            isSoldOut: isSoldOut([option])
          };
          return xformVariant(option, optionMedia, optionInventory);
        });
      }
      return newVariant;
    });

  return {
    // We want to explicitly map everything so that new properties added to product are not published to a catalog unless we want them
    _id: product._id,
    barcode: product.barcode,
    createdAt: product.createdAt || new Date(),
    description: product.description,
    height: product.height,
    inventoryAvailableToSell: product.inventoryAvailableToSell || 0,
    inventoryInStock: product.inventoryInStock || 0,
    isBackorder: isBackorder(variants),
    isDeleted: !!product.isDeleted,
    isLowQuantity: isLowQuantity(variants),
    isSoldOut: isSoldOut(variants),
    isVisible: !!product.isVisible,
    length: product.length,
    lowInventoryWarningThreshold: product.lowInventoryWarningThreshold,
    media: catalogProductMedia,
    metafields: product.metafields,
    metaDescription: product.metaDescription,
    originCountry: product.originCountry,
    pageTitle: product.pageTitle,
    parcel: product.parcel,
    primaryImage,
    // The _id prop could change whereas this should always point back to the source product in Products collection
    productId: product._id,
    productType: product.productType,
    shopId: product.shopId,
    sku: product.sku,
    slug: product.handle,
    socialMetadata: [
      { service: "twitter", message: product.twitterMsg },
      { service: "facebook", message: product.facebookMsg },
      { service: "googleplus", message: product.googleplusMsg },
      { service: "pinterest", message: product.pinterestMsg }
    ],
    supportedFulfillmentTypes: product.supportedFulfillmentTypes,
    tagIds: product.hashtags,
    title: product.title,
    type: "product-simple",
    updatedAt: product.updatedAt || product.createdAt || new Date(),
    variants: catalogProductVariants,
    vendor: product.vendor,
    weight: product.weight,
    width: product.width
  };
}

/**
 * @method createCatalogProduct
 * @summary Publish a product to the Catalog collection
 * @memberof Catalog
 * @param {Object} product - A product object
 * @param {Object} context - The app context
 * @return {boolean} true on successful publish, false if publish was unsuccessful
 */
export default async function createCatalogProduct(product, context) {
  const { collections, getFunctionsOfType } = context;
  const { Products, Shops } = collections;

  if (!product) {
    Logger.error("Cannot publish to catalog: undefined product");
    return false;
  }

  if (Array.isArray(product.ancestors) && product.ancestors.length) {
    Logger.error("Cannot publish to catalog: product is a variant");
    return false;
  }

  const shop = await Shops.findOne(
    { _id: product.shopId },
    {
      fields: {
        currencies: 1,
        currency: 1
      }
    }
  );
  if (!shop) {
    Logger.error(`Cannot publish to catalog: product's shop (ID ${product.shopId}) not found`);
    return false;
  }

  // Get all variants of the product and denormalize them into an array on the CatalogProduct
  const variants = await Products.find({
    ancestors: product._id,
    isDeleted: { $ne: true },
    isVisible: { $ne: false }
  }).toArray();

  const catalogProduct = await xformProduct({ collections, product, shop, variants });

  // Apply custom transformations from plugins.
  for (const customPublishFn of getFunctionsOfType("publishProductToCatalog")) {
    // Functions of type "publishProductToCatalog" are expected to mutate the provided catalogProduct.
    // eslint-disable-next-line no-await-in-loop
    await customPublishFn(catalogProduct, { context, product, shop, variants });
  }

  return catalogProduct;
}
