import hash from "object-hash";
import Random from "@reactioncommerce/random";

/**
 * @method createProductHash
 * @summary Create a hash of a product to compare for updates
 * @memberof Catalog
 * @param {String} product - A product object
 * @return {String} product hash
 */
function createProductHash(product) {
  const hashableFields = {
    _id: product._id,
    ancestors: product.ancestors,
    description: product.description,
    facebookMsg: product.facebookMsg,
    googleplusMsg: product.googleplusMsg,
    handle: product.handle,
    hashtags: product.hashtags,
    isBackorder: product.isBackorder,
    isDeleted: product.isDeleted,
    isLowQuantity: product.isLowQuantity,
    isSoldOut: product.isSoldOut,
    isVisible: product.isVisible,
    metaDescription: product.metaDescription,
    metafields: product.metafields,
    originCountry: product.originCountry,
    pageTitle: product.pageTitle,
    parcel: product.parcel,
    pinterestMsg: product.pinterestMsg,
    positions: product.positions,
    productType: product.productType,
    price: {
      range: product.price.range,
      min: product.price.min,
      max: product.price.max
    },
    publishedScope: product.publishedScope,
    requiresShipping: product.requiresShipping,
    shopId: product.shopId,
    template: product.template,
    title: product.title,
    twitterMsg: product.twitterMsg,
    type: product.type,
    vendor: product.vendor,
    workflow: {
      status: product.workflow.status
    }
  };

  return hash(hashableFields);
}

/**
 * @method hashProduct
 * @summary Create a hash of a product to compare for updates
 * @memberof Catalog
 * @param {String} productId - A productId
 * @param {Object} collections - Raw mongo collections
 * @return {Object} updated product if successful, original product if unsuccessful
 */
export default async function hashProduct(productId, collections) {
  const { Products } = collections;

  const product = await Products.findOne({ _id: productId });

  const productHash = createProductHash(product, collections);

  // Insert/update product document with hash field
  const result = await Products.updateOne(
    {
      _id: productId
    },
    {
      $set: {
        publishedProductHash: productHash,
        updatedAt: new Date()
      }
    }
  );

  if (result && result.result && result.result.ok === 1) {
    // If product was updated, get updated product from database
    const updatedProduct = await Products.findOne({ _id: productId });

    return updatedProduct;
  }

  return null;
}
