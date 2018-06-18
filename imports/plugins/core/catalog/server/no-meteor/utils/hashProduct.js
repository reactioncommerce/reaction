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

  // Remove the following fields from the hash calculation
  // createdAt and updatedAt because they are machine calculated / not manually updated
  // hash, because we are using this to calculate the new hash
  const skippedFields = ["hash", "createdAt", "updatedAt"];

  // Remove the skipped fields from the product object before we calculate hash
  skippedFields.forEach((field) => {
    delete product[field];
  });

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

  if (result && result.result && result.result.ok === 1) {
    // If product was updated, get updated product from database
    const updatedProduct = await Products.findOne(product.productId);
    return updatedProduct;
  }

  return product;
}
