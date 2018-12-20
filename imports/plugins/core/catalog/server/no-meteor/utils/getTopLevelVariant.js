/**
 *
 * @method getTopLevelVariant
 * @summary Get a top level variant based on provided ID
 * @param {String} productOrVariantId - A variant or top level Product Variant ID.
 * @param {Object} collections - Raw mongo collections.
 * @return {Promise<Object[]>} Top level product object.
 */
export default async function getTopLevelVariant(productOrVariantId, collections) {
  const { Products } = collections;

  // Find a product or variant
  let product = await Products.findOne({
    _id: productOrVariantId,
    projection: {
      ancestors: 1
    }
  });

  // If the found product has two ancestors, this means it's an option, and we get it's parent variant
  //  otherwise we have the top level variant, and we return it.
  if (product && Array.isArray(product.ancestors) && product.ancestors.length && product.ancestors.length === 2) {
    product = await Products.findOne({
      _id: product.ancestors[1]
    });
  }

  return product;
}
