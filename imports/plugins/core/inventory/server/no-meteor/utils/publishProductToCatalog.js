/**
 * @summary Publishes our plugin-specific product fields to the catalog
 * @param {Object} catalogProduct The catalog product that is being built. Should mutate this.
 * @param {Object} input Input data
 * @returns {undefined}
 */
export default async function publishProductToCatalog(catalogProduct, { context, variants }) {
  // Most inventory information is looked up and included at read time, when
  // preparing a response to a GraphQL query, but we need to store these
  // three boolean flags in the Catalog collection to enable sorting
  // catalogItems query results by them.
  const topVariants = variants.filter((variant) => variant.ancestors.length === 1);

  const topVariantsInventoryInfo = await context.queries.inventoryForProductConfigurations(context, {
    productConfigurations: topVariants.map((option) => ({
      isSellable: !variants.some((variant) => variant.ancestors.includes(option._id)),
      productId: option.ancestors[0],
      productVariantId: option._id
    })),
    fields: ["isBackorder", "isLowQuantity", "isSoldOut"],
    variants
  });

  // Mutate the catalog product to be saved
  catalogProduct.isBackorder = topVariantsInventoryInfo.every(({ inventoryInfo }) => inventoryInfo.isBackorder);
  catalogProduct.isLowQuantity = topVariantsInventoryInfo.some(({ inventoryInfo }) => inventoryInfo.isLowQuantity);
  catalogProduct.isSoldOut = topVariantsInventoryInfo.every(({ inventoryInfo }) => inventoryInfo.isSoldOut);
}
