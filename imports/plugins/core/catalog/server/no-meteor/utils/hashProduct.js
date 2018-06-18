import hash from "object-hash";
import Random from "@reactioncommerce/random";

/**
 * @method hashProduct
 * @summary Create a hash of a product to compare for updates
 * @memberof Catalog
 * @param {Object} product - A product object
 * @param {Object} collections - Raw mongo collections
 * @return {Object} updated product if successful, original product if unsuccessful
 */
export default async function hashProduct(product, collections) {
  const { Products } = collections;

  // we need to create a new product object to remove fields we don't want hashed
  // Remove system created info
  const productHash = hash(product);

  // Insert/update product document with hash field
  const result = await Products.updateOne(
    {
      "product.productId": product.productId
    },
    {
      $set: {
        hash: productHash,
        updatedAt: new Date()
      },
      $setOnInsert: {
        _id: Random.id(),
        createdAt: new Date()
      }
    },
    { upsert: true }
  );

  // Get updated product from database
  const updatedProduct = await Products.findOne(product.productId);

  if (result && result.result && result.result.ok === 1) {
    return updatedProduct;
  }

  return product;
}
