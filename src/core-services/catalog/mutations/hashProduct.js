import hash from "object-hash";
import { customPublishedProductFields, customPublishedProductVariantFields } from "../registration.js";
import getTopLevelProduct from "../utils/getTopLevelProduct.js";

const productFieldsThatNeedPublishing = [
  "_id",
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
  "shopId",
  "supportedFulfillmentTypes",
  "template",
  "title",
  "twitterMsg",
  "type",
  "vendor"
];

const variantFieldsThatNeedPublishing = [
  "_id",
  "attributeLabel",
  "barcode",
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
 * @method createProductHash
 * @summary Create a hash of a product to compare for updates
 * @memberof Catalog
 * @param {Object} context App context
 * @param {String} product The Product document to hash. Expected to be a top-level product, not a variant
 * @returns {String} product hash
 */
export async function createProductHash(context, product) {
  const variants = await context.collections.Products.find({ ancestors: product._id, type: "variant" }).toArray();

  const productForHashing = {};
  productFieldsThatNeedPublishing.forEach((field) => {
    productForHashing[field] = product[field];
  });
  customPublishedProductFields.forEach((field) => {
    productForHashing[field] = product[field];
  });

  // Track changes to all variants, too
  productForHashing.variants = variants.map((variant) => {
    const variantForHashing = {};
    variantFieldsThatNeedPublishing.forEach((field) => {
      variantForHashing[field] = variant[field];
    });
    customPublishedProductVariantFields.forEach((field) => {
      variantForHashing[field] = variant[field];
    });
    return variantForHashing;
  });

  for (const func of context.getFunctionsOfType("mutateProductHashObject")) {
    await func(context, { productForHashing, product }); // eslint-disable-line no-await-in-loop
  }

  return hash(productForHashing);
}

/**
 * @method hashProduct
 * @summary Create a hash of a product to compare for updates
 * @memberof Catalog
 * @param {Object} context - App context
 * @param {String} productId - A productId
 * @param {Boolean} isPublished - Is product published to catalog
 * @returns {Object} updated product if successful, original product if unsuccessful
 */
export default async function hashProduct(context, productId, isPublished = true) {
  const { collections } = context;
  const { Products } = collections;

  const topLevelProduct = await getTopLevelProduct(productId, collections);
  if (!topLevelProduct) {
    throw new Error(`No top level product found for product with ID ${productId}`);
  }

  const productHash = await createProductHash(context, topLevelProduct);

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

  if (result && result.result && result.result.ok === 1) {
    return { ...topLevelProduct, ...productUpdates };
  }

  return null;
}
