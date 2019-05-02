import has from "lodash/has";

const inventoryVariantFields = [
  "canBackorder",
  "inventoryAvailableToSell",
  "inventoryInStock",
  "inventoryReserved",
  "isBackorder",
  "isLowQuantity",
  "isSoldOut"
];

/**
 * @summary Mutates an array of CatalogProductVariant to add inventory fields at read time
 * @param {Object} context App context
 * @param {Object[]} catalogProductVariants An array of CatalogProductVariant objects
 * @param {Object} info Additional info
 * @return {undefined} Returns nothing. Potentially mutates `catalogProductVariants`
 */
export default async function xformCatalogProductVariants(context, catalogProductVariants, info) {
  const { catalogProduct, fields } = info;

  const anyInventoryFieldWasRequested = inventoryVariantFields.some((field) => has(fields, field));
  if (!anyInventoryFieldWasRequested) return;

  const productConfigurations = [];
  for (const catalogProductVariant of catalogProductVariants) {
    productConfigurations.push({
      isSellable: (catalogProductVariant.options || []).length === 0,
      productId: catalogProduct.productId,
      variantId: catalogProductVariant.variantId
    });

    for (const option of (catalogProductVariant.options || [])) {
      productConfigurations.push({
        isSellable: true,
        productId: catalogProduct.productId,
        variantId: option.variantId
      });
    }
  }

  const variantsInventoryInfo = await context.queries.inventoryForProductConfigurations(context, {
    productConfigurations
  });

  for (const catalogProductVariant of catalogProductVariants) {
    const { inventoryInfo: variantInventoryInfo } = variantsInventoryInfo.find(({ productConfiguration }) =>
      productConfiguration.variantId === catalogProductVariant.variantId);
    Object.getOwnPropertyNames(variantInventoryInfo).forEach((key) => {
      catalogProductVariant[key] = variantInventoryInfo[key];
    });

    for (const option of (catalogProductVariant.options || [])) {
      const { inventoryInfo: optionInventoryInfo } = variantsInventoryInfo.find(({ productConfiguration }) =>
        productConfiguration.variantId === option.variantId);
      Object.getOwnPropertyNames(optionInventoryInfo).forEach((key) => {
        catalogProductVariant[key] = optionInventoryInfo[key];
      });
    }
  }
}
