import { Orders, Jobs } from "/lib/collections";
import { Logger } from "/server/api";
import { exportToShopify } from "../methods/export/orders";

/**
 * @private
 * @summary Mark orders as exported after export
 * @param {Object} order - the order to mark as failed
 */
function markExportFailed(order) {
  const shops = Object.keys(order.getItemsByShop());
  shops.forEach((shopId) => {
    Orders.update({ _id: order._id }, {
      $push: {
        exportHistory: {
          status: "failure",
          dateAttempted: new Date(),
          exportMethod: "reaction-connectors-shopify",
          shopId
        }
      }
    });
  });
}


export default () => {
  const exportOrders = Jobs.processJobs("connectors/shopify/export/order", {
    pollInterval: 5 * 60 * 1000, // Retry failed orders after 5 minutes
    workTimeout: 30 * 1000
  }, (job, callback) => {
    Logger.info("Starting exportOrders job");
    const { orderId } = job.data;
    const order = Orders.findOne(orderId);
    try {
      exportToShopify(order)
        .then((exportedOrders) => {
          Logger.debug("exported order(s)", exportedOrders);
        })
        .catch((error) => {
          Logger.error("Encountered error when exporting to shopify", error);
          if (error.response && error.response.body) {
            Logger.error(error.response.body);
          }
          markExportFailed(order);
        });
      job.done(`Finished exporting order ${orderId}`);
      callback();
    } catch (error) {
      job.fail(`Failed to export order ${orderId}.`);
      callback();
    }
  });
  Jobs.find({
    type: "connectors/shopify/export/order",
    status: "ready"
  }).observe({
    added() {
      return exportOrders.trigger();
    }
  });
};
