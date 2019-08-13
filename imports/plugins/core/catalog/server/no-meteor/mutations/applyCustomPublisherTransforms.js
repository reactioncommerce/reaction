/**
 * @method applyCustomPublisherTransforms
 * @summary Applies all catalog product transformations registered by other plugins.
 * @param {Object} context - App context
 * @param {Object} catalogProduct - A CatalogProduct entity, which this function may mutate.
 * @param {Object} [options] - Options
 * @param {String} [options.startFrom] Not yet implemented, but a custom plugin that overrides
 *   this function may choose to use this to start from a certain step in the transformation
 *   pipeline.
 * @returns {undefined}
 */
export default async function applyCustomPublisherTransforms(context, catalogProduct, {
  product,
  shop,
  variants
}) {
  for (const customPublishFn of context.getFunctionsOfType("publishProductToCatalog")) {
    // Functions of type "publishProductToCatalog" are expected to mutate the provided catalogProduct.
    // eslint-disable-next-line no-await-in-loop
    await customPublishFn(catalogProduct, {
      context,
      product,
      shop,
      variants
    });
  }
}
