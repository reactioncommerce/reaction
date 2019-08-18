/**
 *
 * @method getTopLevelProduct
 * @summary Get a top level product based on provided ID
 * @param {String} productOrVariantId - A variant or top level Product Variant ID.
 * @param {Object} collections - Raw mongo collections.
 * @returns {Promise<Object[]>} Top level product object.
 */
export default async function getTopLevelProduct(productOrVariantId, collections) {
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
