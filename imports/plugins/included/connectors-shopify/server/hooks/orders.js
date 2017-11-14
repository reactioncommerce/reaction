import { Reaction, Logger } from "/server/api";
import { Orders } from "/lib/collections";

export function exportToShopify(doc) {
  Logger.info("exporting to Shopify");
}


Orders.after.insert((userId, doc) => {
  const { settings } = Reaction.getPackageSettings("reaction-connectors-shopify");
  const { syncHooks } = settings;
  syncHooks.forEach((hook) => {
    if (hook.topic === "orders" && hook.event === "order/create") {
      if (hook.syncType === "exportToShopify") { // should this just be dynamic
        exportToShopify(doc);
      }
    }
  });
});
