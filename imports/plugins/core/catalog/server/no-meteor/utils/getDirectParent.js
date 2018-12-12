/**
 *
 * @method getDirectParent
 * @summary Get a top level product based on provided ID
 * @param {String} productOrVariantId - A variant or top level Product Variant ID.
 * @param {Object} collections - Raw mongo collections.
 * @return {Promise<Object[]>} Top level product object.
 */
export default async function getDirectParent(productOrVariantId, collections) {
  const { Products } = collections;

  // Find a product or variant
  let product = await Products.findOne({
    _id: productOrVariantId
  });

  // If the found product has ancestors,
  // then attempt to find the top-level product
  if (product && Array.isArray(product.ancestors) && product.ancestors.length) {
    if (product.ancestors.length === 2) {
      product = await Products.findOne({
        _id: product.ancestors[1]
      });
    } else {
      product = await Products.findOne({
        _id: product.ancestors[0]
      });
    }
  }

  return product;
}
