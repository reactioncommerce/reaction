/**
 * @param {Object[]} catalogProductVariants The `product.variants` array from a catalog item
 * @returns {Object} Map of variant IDs to updated pricing objects
 */
export default function getVariantPricingMap(catalogProductVariants) {
  const variantPricingMap = {};

  catalogProductVariants.forEach((variant) => {
    variantPricingMap[variant.variantId] = variant.pricing;
    if (variant.options) {
      variant.options.forEach((option) => {
        variantPricingMap[option.variantId] = option.pricing;
      });
    }
  });

  return variantPricingMap;
}
