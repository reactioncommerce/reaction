import { Job } from "meteor/vsivsi:job-collection";
import { Reaction } from "/server/api";
import { Orders, Jobs } from "/lib/collections";


function addExportJob(orderId) {
  new Job(Jobs, "connectors/shopify/export/order", { orderId })
    .priority("normal")
    .retry({
      retries: 5,
      wait: 5000,
      backoff: "exponential"
    }).save();
}


Orders.after.insert((userId, doc) => {
  const pkgData = Reaction.getPackageSettings("reaction-connectors-shopify");
  if (pkgData) {
    const { settings } = pkgData;
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
