import has from "lodash/has";

const inventoryVariantFields = [
  "canBackorder",
  "inventoryAvailableToSell",
  "inventoryInStock",
  "inventoryReserved",
  "isBackorder",
  "isLowQuantity",
  "isSoldOut",
  "options.canBackorder",
  "options.inventoryAvailableToSell",
  "options.inventoryInStock",
  "options.inventoryReserved",
  "options.isBackorder",
  "options.isLowQuantity",
  "options.isSoldOut"
];

/**
 * @summary Mutates an array of CatalogProductVariant to add inventory fields at read time
 * @param {Object} context App context
 * @param {Object[]} catalogProductVariants An array of CatalogProductVariant objects
 * @param {Object} info Additional info
 * @returns {undefined} Returns nothing. Potentially mutates `catalogProductVariants`
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
      productVariantId: catalogProductVariant.variantId
    });

    for (const option of (catalogProductVariant.options || [])) {
      productConfigurations.push({
        isSellable: true,
        productId: catalogProduct.productId,
        productVariantId: option.variantId
      });
    }
  }

  if (productConfigurations.length === 0) return;

  const variantsInventoryInfo = await context.queries.inventoryForProductConfigurations(context, {
    productConfigurations,
    shopId: catalogProductVariants[0].shopId
  });

  for (const catalogProductVariant of catalogProductVariants) {
    const { inventoryInfo: variantInventoryInfo } = variantsInventoryInfo.find(({ productConfiguration }) =>
      productConfiguration.productVariantId === catalogProductVariant.variantId);
    Object.getOwnPropertyNames(variantInventoryInfo).forEach((key) => {
      catalogProductVariant[key] = variantInventoryInfo[key];
    });

    for (const option of (catalogProductVariant.options || [])) {
      const { inventoryInfo: optionInventoryInfo } = variantsInventoryInfo.find(({ productConfiguration }) =>
        productConfiguration.productVariantId === option.variantId);
      Object.getOwnPropertyNames(optionInventoryInfo).forEach((key) => {
        option[key] = optionInventoryInfo[key];
      });
    }
  }
}
