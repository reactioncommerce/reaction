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

/**
 *
 * @method getTopLevelProduct
 * @summary Get a top level product based on provided ID
 * @param {String} productOrVariantId - A variant or top level Product Variant ID.
 * @param {Object} collections - Raw mongo collections.
 * @return {Promise<Object[]>} Top level product object.
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
 * @param {String} product - The Product document to hash
 * @return {String} product hash
 */
function createProductHash(product) {
  const productForHashing = {};
  productFieldsThatNeedPublishing.forEach((field) => {
    productForHashing[field] = product[field];
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
 * @return {Object} updated product if successful, original product if unsuccessful
 */
export default async function hashProduct(productId, collections, isPublished = true) {
  const { Products } = collections;

  const product = await getTopLevelProduct(productId, collections);

  const productHash = createProductHash(product);

  // Insert/update product document with hash field
  const hashFields = {
    currentProductHash: productHash
  };

  if (isPublished) {
    hashFields.publishedProductHash = productHash;
  }

  const result = await Products.updateOne(
    {
      _id: product._id
    },
    {
      $set: {
        ...hashFields,
        updatedAt: new Date()
      }
    }
  );

  if (!result || !result.result || result.result.ok !== 1) {
    Logger.error(result && result.result);
    throw new Error(`Failed to update product hashes for product with ID ${product._id}`);
  }

  return null;
}
