/**
 * @name "CatalogProduct.variants"
 * @method
 * @memberof Catalog/GraphQL
 * @summary Adjusts the variants prop of a product
 * @param {Object} product - CatalogProduct response from parent resolver
 * @return {Promise<Object[]>} Promise that resolves with an array of variants
 */
export default async function variants(product) {
  const { variants: productVariants } = product;
  if (!productVariants || productVariants.length === 0) return null;

  return productVariants.filter((variant) => !variant.isDeleted && variant.isVisible).map((variant) => ({
    ...variant,
    index: variant.index || 0,
    isBackorder: !!variant.isBackorder,
    isLowQuantity: !!variant.isLowQuantity,
    isSoldOut: !!variant.isSoldOut,
    isTaxable: !!variant.taxable,
    updatedAt: variant.updatedAt || variant.createdAt
  }));
}
