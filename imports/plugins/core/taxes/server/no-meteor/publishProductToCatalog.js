/**
 * @summary Publishes our plugin-specific product fields to the catalog
 * @param {Object} catalogProduct The catalog product that is being built. Should mutate this.
 * @param {Object} input Input data
 * @returns {undefined}
 */
export default function publishProductToCatalog(catalogProduct, { variants }) {
  catalogProduct.variants.forEach((catalogProductVariant) => {
    const unpublishedVariant = variants.find((variant) => variant._id === catalogProductVariant.variantId);
    if (unpublishedVariant) {
      catalogProductVariant.isTaxable = !!unpublishedVariant.isTaxable;
      catalogProductVariant.taxCode = unpublishedVariant.taxCode;
      catalogProductVariant.taxDescription = unpublishedVariant.taxDescription;
    }

    if (catalogProductVariant.options) {
      catalogProductVariant.options.forEach((catalogProductVariantOption) => {
        const unpublishedVariantOption = variants.find((variant) => variant._id === catalogProductVariantOption.variantId);
        if (unpublishedVariantOption) {
          catalogProductVariantOption.isTaxable = !!unpublishedVariantOption.isTaxable;
          catalogProductVariantOption.taxCode = unpublishedVariantOption.taxCode;
          catalogProductVariantOption.taxDescription = unpublishedVariantOption.taxDescription;
        }
      });
    }
  });
}
