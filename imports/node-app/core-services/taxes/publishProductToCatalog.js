/**
 * @summary Publishes our plugin-specific product fields to the catalog
 * @param {Object} catalogProduct The catalog product that is being built. Should mutate this.
 * @param {Object} input Input data
 * @returns {undefined}
 */
export default function publishProductToCatalog(catalogProduct, { variants }) {
  catalogProduct.variants.forEach((catalogProductVariant) => {
    const unpublishedVariant = variants.find((variant) => variant._id === catalogProductVariant.variantId);
    if (!unpublishedVariant) return;

    catalogProductVariant.isTaxable = !!unpublishedVariant.isTaxable;
    catalogProductVariant.taxCode = unpublishedVariant.taxCode;
    catalogProductVariant.taxDescription = unpublishedVariant.taxDescription;

    if (catalogProductVariant.options) {
      catalogProductVariant.options.forEach((catalogProductVariantOption) => {
        const unpublishedVariantOption = variants.find((variant) => variant._id === catalogProductVariantOption.variantId);
        if (unpublishedVariantOption) {
          // For backward compatibility, we fall back to using the parent variant tax info if properties
          // are undefined.
          catalogProductVariantOption.isTaxable = unpublishedVariantOption.isTaxable === undefined
            ? !!unpublishedVariant.isTaxable : unpublishedVariantOption.isTaxable;
          catalogProductVariantOption.taxCode = typeof unpublishedVariantOption.taxCode === "string"
            ? unpublishedVariantOption.taxCode : unpublishedVariant.taxCode;
          catalogProductVariantOption.taxDescription = typeof unpublishedVariantOption.taxDescription === "string"
            ? unpublishedVariantOption.taxDescription : unpublishedVariant.taxDescription;
        } else {
          catalogProductVariantOption.isTaxable = !!unpublishedVariant.isTaxable;
          catalogProductVariantOption.taxCode = unpublishedVariant.taxCode;
          catalogProductVariantOption.taxDescription = unpublishedVariant.taxDescription;
        }
      });
    }
  });
}
