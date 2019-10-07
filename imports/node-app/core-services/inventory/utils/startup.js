/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { appEvents } = context;

  // Whenever inventory is updated for any sellable variant, the plugin that did the update is
  // expected to emit `afterInventoryUpdate`. We listen for this and keep the boolean fields
  // on the CatalogProduct correct.
  appEvents.on("afterInventoryUpdate", async ({ productConfiguration }) =>
    context.mutations.partialProductPublish(context, { productId: productConfiguration.productId, startFrom: "inventory" }));

  appEvents.on("afterBulkInventoryUpdate", async ({ productConfigurations }) => {
    // Since it is a bulk update and many of the product configurations may be for the same
    // productId, we can avoid unnecessary work by running the update only once per productId.
    const uniqueProductIds = productConfigurations.reduce((list, productConfiguration) => {
      const { productId } = productConfiguration;
      if (!list.includes(productId)) {
        list.push(productId);
      }
      return list;
    }, []);
    uniqueProductIds.forEach((productId) => {
      context.mutations.partialProductPublish(context, { productId, startFrom: "inventory" });
    });
  });
}
