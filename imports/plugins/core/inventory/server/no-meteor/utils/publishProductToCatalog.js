import Logger from "@reactioncommerce/logger";
/**
 * @summary Publishes our plugin-specific product fields to the catalog
 * @param {Object} catalogProduct The catalog product that is being built. Should mutate this.
 * @param {Object} input Input data
 * @returns {undefined}
 */
export default async function publishProductToCatalog(catalogProduct, { context, variants }) {
  const { PRODUCT_LOW_INVENTORY_THRESHOLD } = process.env;
  const DEFAULT_LOW_INVENTORY_THRESHOLD = 10;
  // Most inventory information is looked up and included at read time, when
  // preparing a response to a GraphQL query, but we need to store these
  // three boolean flags in the Catalog collection to enable sorting
  // catalogItems query results by them.
  const topVariants = variants.filter((variant) => variant.ancestors.length === 1);

  const topVariantsInventoryInfo = await context.queries.inventoryForProductConfigurations(context, {
    fields: ["isBackorder", "isLowQuantity", "isSoldOut"],
    productConfigurations: topVariants.map((option) => ({
      isSellable: !variants.some((variant) => variant.ancestors.includes(option._id)),
      productId: option.ancestors[0],
      productVariantId: option._id
    })),
    shopId: catalogProduct.shopId
  });

  const productQuantity = topVariantsInventoryInfo.reduce(
    (sum, { inventoryInfo: { inventoryAvailableToSell } }) => sum + inventoryAvailableToSell,
    0
  );

  if (!PRODUCT_LOW_INVENTORY_THRESHOLD) {
    Logger.warn("Missing .env variable PRODUCT_LOW_INVENTORY_THRESHOLD, using default value.");
  }

  // Mutate the catalog product to be saved
  catalogProduct.isBackorder = topVariantsInventoryInfo.every(({ inventoryInfo }) => inventoryInfo.isBackorder);
  catalogProduct.isLowQuantity = productQuantity < (PRODUCT_LOW_INVENTORY_THRESHOLD || DEFAULT_LOW_INVENTORY_THRESHOLD);
  catalogProduct.isSoldOut = topVariantsInventoryInfo.every(({ inventoryInfo }) => inventoryInfo.isSoldOut);
}
