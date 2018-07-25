import hash from "object-hash";
import createCatalogProduct from "../utils/createCatalogProduct";
import getTopLevelProduct from "../utils/getTopLevelProduct";

/**
 * @method createProductHash
 * @summary Create a hash of a product to compare for updates
 * @memberof Catalog
 * @param {String} productToConvert - A product object
 * @param {Object} collections - Raw mongo collections
 * @return {String} product hash
 */
export async function createProductHash(productToConvert, collections) {
  const product = await createCatalogProduct(productToConvert, collections);

  const hashableFields = {
    _id: product._id,
    ancestors: product.ancestors,
    description: product.description,
    facebookMsg: product.facebookMsg,
    googleplusMsg: product.googleplusMsg,
    handle: product.handle,
    hashtags: product.hashtags,
    isDeleted: product.isDeleted,
    isVisible: product.isVisible,
    media: product.media,
    metaDescription: product.metaDescription,
    metafields: product.metafields,
    originCountry: product.originCountry,
    pageTitle: product.pageTitle,
    parcel: product.parcel,
    pinterestMsg: product.pinterestMsg,
    productType: product.productType,
    price: product.price,
    pricing: product.pricing,
    publishedScope: product.publishedScope,
    requiresShipping: product.requiresShipping,
    shopId: product.shopId,
    template: product.template,
    title: product.title,
    twitterMsg: product.twitterMsg,
    type: product.type,
    variants: product.variants,
    vendor: product.vendor
  };

  return hash(hashableFields);
}

/**
 * @method hashProduct
 * @summary Create a hash of a product to compare for updates
 * @memberof Catalog
 * @param {String} productId - A productId
 * @param {Object} collections - Raw mongo collections
 * @param {Object} isPublished - Is product published to catalog
 * @return {Object} updated product if successful, original product if unsuccessful
 */
export default async function hashProduct(productId, collections, isPublished = true) {
  const { Products } = collections;

  const product = await getTopLevelProduct(productId, collections);

  const productHash = await createProductHash(product, collections);

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

  if (result && result.result && result.result.ok === 1) {
    // If product was updated, get updated product from database
    const updatedProduct = await Products.findOne({ _id: product._id });

    return updatedProduct;
  }

  return null;
}
