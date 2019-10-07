/**
 * @summary Extend SimpleSchemas with inventory fields
 * @param {Object} schemas Simple schemas
 * @returns {undefined}
 */
export function extendInventorySchemas(schemas) {
  /**
   * @property {Boolean} isBackorder required, Indicates when a product is currently backordered
   * @property {Boolean} isLowQuantity required, Indicates that the product quantity is too low
   * @property {Boolean} isSoldOut required, Indicates when the product quantity is zero
   */
  schemas.CatalogProduct.extend({
    isBackorder: Boolean,
    isLowQuantity: Boolean,
    isSoldOut: Boolean
  });

  // Extend variants by adding a isSoldOut prop
  const variantSchemaExtension = {
    isSoldOut: Boolean
  };

  schemas.CatalogProductOption.extend(variantSchemaExtension);
  schemas.CatalogProductVariant.extend(variantSchemaExtension);
}
