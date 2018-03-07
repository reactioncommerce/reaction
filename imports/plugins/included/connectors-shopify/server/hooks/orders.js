import { Job } from "/imports/plugins/core/job-collection/lib";
import { Hooks, Reaction } from "/server/api";
import { Jobs } from "/lib/collections";


function addExportJob(orderId) {
  new Job(Jobs, "connectors/shopify/export/order", { orderId })
    .priority("normal")
    .retry({
      retries: 5,
      wait: 5000,
      backoff: "exponential"
    }).save();
}


Hooks.Events.add("afterOrderInsert", (doc) => {
  // Ensure we have items
  if (doc && doc.items && Array.isArray(doc.items)) {
    // Get all shopIds represented in this cart
    const shopIdsInCart = doc.items.map((item) => item.shopId);

    // get the unique set of shopIds in this cart
    const uniqueShopIds = [...new Set(shopIdsInCart)];

    // For each shopid check to see if there are synchooks are respond appropriately
    uniqueShopIds.forEach((shopId) => {
      const shopifyPkg = Reaction.getPackageSettingsWithOptions({
        shopId,
        name: "reaction-connectors-shopify"
      });
      if (shopifyPkg) {
        const { settings } = shopifyPkg;
        const { synchooks } = settings;
        if (synchooks) {
          synchooks.forEach((hook) => {
            if (hook.topic === "orders" && hook.event === "orders/create" && hook.syncType === "exportToShopify") {
              addExportJob(doc._id);
            }
          });
        }
      }
    });
  }

  return doc;
});
