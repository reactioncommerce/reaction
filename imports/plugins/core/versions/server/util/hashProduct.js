import hash from "object-hash";
import Logger from "@reactioncommerce/logger";

const productFieldsThatNeedPublishing = [
  "_id",
  "ancestors",
  "description",
  "facebookMsg",
  "googleplusMsg",
  "handle",
  "hashtags",
  "isDeleted",
  "isVisible",
  "media",
  "metaDescription",
  "metafields",
  "originCountry",
  "pageTitle",
  "parcel",
  "pinterestMsg",
  "productType",
  "price",
  "pricing",
  "publishedScope",
  "shopId",
  "supportedFulfillmentTypes",
  "template",
  "title",
  "twitterMsg",
  "type",
  "variants",
  "vendor"
];

const variantFieldsThatNeedPublishing = [
  "_id",
  "barcode",
  "compareAtPrice",
  "height",
  "index",
  "isDeleted",
  "isVisible",
  "length",
  "metafields",
  "minOrderQuantity",
  "optionTitle",
  "originCountry",
  "shopId",
  "sku",
  "title",
  "type",
  "weight",
  "width"
];

/**
 *
 * @method getCatalogProductMedia
 * @summary Get an array of ImageInfo objects by Product ID
 * @param {String} productId -  A product ID. Must be a top-level product.
 * @param {Object} collections - Raw mongo collections
 * @returns {Promise<Object[]>} Array of ImageInfo objects sorted by priority
 */
async function getCatalogProductMedia(productId, collections) {
  const { Media } = collections;
  const mediaArray = await Media.find(
    {
      "metadata.productId": productId,
      "metadata.toGrid": 1,
      "metadata.workflow": { $nin: ["archived", "unpublished"] }
    },
    {
      sort: { "metadata.priority": 1, "uploadedAt": 1 }
    }
  );

  // Denormalize media
  const catalogProductMedia = mediaArray
    .map((media) => {
      const { metadata } = media;
      const { toGrid, priority, productId: prodId, variantId } = metadata || {};

      return {
        priority,
        toGrid,
        productId: prodId,
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
    .sort((itemA, itemB) => itemA.priority - itemB.priority);

  return catalogProductMedia;
}

/**
 *
 * @method getTopLevelProduct
 * @summary Get a top level product based on provided ID
 * @param {String} productOrVariantId - A variant or top level Product Variant ID.
 * @param {Object} collections - Raw mongo collections.
 * @returns {Promise<Object[]>} Top level product object.
 */
async function getTopLevelProduct(productOrVariantId, collections) {
  const { Products } = collections;

  // Find a product or variant
  let product = await Products.findOne({
    _id: productOrVariantId
  });

  // If the found product has ancestors,
  // then attempt to find the top-level product
  if (product && Array.isArray(product.ancestors) && product.ancestors.length) {
    product = await Products.findOne({
      _id: product.ancestors[0]
    });
  }

  return product;
}

/**
 * @method createProductHash
 * @summary Create a hash of a product to compare for updates
 * @memberof Catalog
 * @param {String} product - The Product document to hash. Expected to be a top-level product, not a variant
 * @param {Object} collections - Raw mongo collections
 * @returns {String} product hash
 */
async function createProductHash(product, collections) {
  const variants = await collections.Products.find({ ancestors: product._id, type: "variant" }).toArray();

  const productForHashing = {};
  productFieldsThatNeedPublishing.forEach((field) => {
    productForHashing[field] = product[field];
  });

  // Track changes to all related media, too
  productForHashing.media = await getCatalogProductMedia(product._id, collections);

  // Track changes to all variants, too
  productForHashing.variants = variants.map((variant) => {
    const variantForHashing = {};
    variantFieldsThatNeedPublishing.forEach((field) => {
      variantForHashing[field] = variant[field];
    });
    return variantForHashing;
  });

  return hash(productForHashing);
}

/**
 * @method hashProduct
 * @summary Create a hash of a product to compare for updates
 * @memberof Catalog
 * @param {String} productId - A productId
 * @param {Object} collections - Raw mongo collections
 * @param {Boolean} isPublished - Is product published to catalog
 * @returns {Object} updated product if successful, original product if unsuccessful
 */
export default async function hashProduct(productId, collections, isPublished = true) {
  const { Products } = collections;

  const topLevelProduct = await getTopLevelProduct(productId, collections);
  if (!topLevelProduct) {
    throw new Error(`No top level product found for product with ID ${productId}`);
  }

  const productHash = await createProductHash(topLevelProduct, collections);

  // Insert/update product document with hash field
  const hashFields = {
    currentProductHash: productHash
  };

  if (isPublished) {
    hashFields.publishedProductHash = productHash;
  }

  const productUpdates = {
    ...hashFields,
    updatedAt: new Date()
  };
  const result = await Products.updateOne({ _id: topLevelProduct._id }, { $set: productUpdates });

  if (!result || !result.result || result.result.ok !== 1) {
    Logger.error(result && result.result);
    throw new Error(`Failed to update product hashes for product with ID ${topLevelProduct._id}`);
  }

  return null;
}
