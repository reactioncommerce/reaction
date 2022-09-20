import Logger from "@reactioncommerce/logger";
import getCatalogProductMedia from "./getCatalogProductMedia.js";

/**
 * @method
 * @summary Converts a variant Product document into the catalog schema for variants
 * @param {Object} variant The variant from Products collection
 * @param {Object} variantMedia Media for this specific variant
 * @private
 * @returns {Object} The transformed variant
 */
export function xformVariant(variant, variantMedia) {
  const primaryImage = variantMedia[0] || null;

  return {
    _id: variant._id,
    attributeLabel: variant.attributeLabel,
    barcode: variant.barcode,
    createdAt: variant.createdAt || new Date(),
    height: variant.height,
    index: variant.index || 0,
    length: variant.length,
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
 * @param {Object} data.context App context
 * @param {Object} data.product The source product
 * @param {Object[]} data.variants The Product documents for all variants of this product
 * @returns {Object} The CatalogProduct document
 */
export async function xformProduct({ context, product, variants }) {
  const { collections } = context;
  const catalogProductMedia = await getCatalogProductMedia(product._id, collections);
  const primaryImage = catalogProductMedia[0] || null;

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
      const variantMedia = catalogProductMedia.filter((media) => media.variantId === variant._id);
      const newVariant = xformVariant(variant, variantMedia);

      const variantOptions = options.get(variant._id);
      if (variantOptions) {
        newVariant.options = variantOptions.map((option) => {
          const optionMedia = catalogProductMedia.filter((media) => media.variantId === option._id);
          return xformVariant(option, optionMedia);
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
    isDeleted: !!product.isDeleted,
    isVisible: !!product.isVisible,
    length: product.length,
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
 * @returns {boolean} true on successful publish, false if publish was unsuccessful
 */
export default async function createCatalogProduct(product, context) {
  const { collections } = context;
  const { Products, Shops } = collections;

  if (!product) {
    Logger.error("Cannot publish to catalog: undefined product");
    return false;
  }

  if (Array.isArray(product.ancestors) && product.ancestors.length) {
    Logger.error("Cannot publish to catalog: product is a variant");
    return false;
  }

  const shop = await Shops.findOne({ _id: product.shopId });
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

  const catalogProduct = await xformProduct({ context, product, shop, variants });

  await context.mutations.applyCustomPublisherTransforms(context, catalogProduct, {
    product,
    shop,
    variants
  });

  return catalogProduct;
}
