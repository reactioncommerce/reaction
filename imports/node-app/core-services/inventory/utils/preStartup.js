/**
 * @summary Called pre startup
 * @param {Object} context Startup context
 * @param {Object} context.simpleSchemas Simple schemas
 * @returns {undefined}
 */
export default async function preStartup(context) {
  /**
   * @property {Boolean} isBackorder required, Indicates when a product is currently backordered
   * @property {Boolean} isLowQuantity required, Indicates that the product quantity is too low
   * @property {Boolean} isSoldOut required, Indicates when the product quantity is zero
   */
  context.simpleSchemas.CatalogProduct.extend({
    isBackorder: Boolean,
    isLowQuantity: Boolean,
    isSoldOut: Boolean
  });

  // Extend variants by adding a isSoldOut prop
  const variantSchemaExtension = {
    isSoldOut: Boolean
  };

  context.simpleSchemas.CatalogProductOption.extend(variantSchemaExtension);
  context.simpleSchemas.CatalogProductVariant.extend(variantSchemaExtension);
}
