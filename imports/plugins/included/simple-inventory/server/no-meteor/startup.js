import Logger from "@reactioncommerce/logger";
import orderIsApproved from "./utils/orderIsApproved";

/**
 * @summary Get all order items
 * @param {Object} order The order
 * @return {Object[]} Order items from all fulfillment groups in a single array
 */
function getAllOrderItems(order) {
  return order.shipping.reduce((list, group) => [...list, ...group.items], []);
}

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { appEvents, collections } = context;
  const { SimpleInventory } = collections;

  appEvents.on("afterOrderCancel", async ({ order, returnToStock }) => {
    // Inventory is removed from stock only once an order has been approved
    // This is indicated by payment.status being anything other than `created`
    // We need to check to make sure the inventory has been removed before we return it to stock
    const isOrderApproved = orderIsApproved(order);
    const allOrderItems = getAllOrderItems(order);

    const bulkWriteOperations = [];

    // If order is approved, the inventory has been taken away from `inventoryInStock`
    if (returnToStock && isOrderApproved) {
      allOrderItems.forEach((item) => {
        bulkWriteOperations.push({
          updateOne: {
            filter: {
              "productConfiguration.productVariantId": item.variantId
            },
            update: {
              $inc: {
                inventoryInStock: item.quantity
              }
            }
          }
        });
      });
    } else if (!isOrderApproved) {
      // If order is not approved, the inventory hasn't been taken away from `inventoryInStock` yet but is in `inventoryReserved`
      allOrderItems.forEach((item) => {
        bulkWriteOperations.push({
          updateOne: {
            filter: {
              "productConfiguration.productVariantId": item.variantId
            },
            update: {
              $inc: {
                inventoryReserved: -item.quantity
              }
            }
          }
        });
      });
    }

    if (bulkWriteOperations.length === 0) return;

    await SimpleInventory.bulkWrite(bulkWriteOperations, { ordered: false })
      .then(() => (
        Promise.all(allOrderItems.map((item) => (
          appEvents.emit("afterInventoryUpdate", {
            productConfiguration: {
              productId: item.productId,
              productVariantId: item.variantId
            },
            updatedBy: null
          })
        )))
      ))
      .catch((error) => {
        Logger.error(error, "Bulk write error in simple-inventory afterOrderCancel listener");
      });
  });

  appEvents.on("afterOrderCreate", async ({ order }) => {
    const allOrderItems = getAllOrderItems(order);

    const bulkWriteOperations = allOrderItems.map((item) => ({
      updateOne: {
        filter: {
          "productConfiguration.productVariantId": item.variantId
        },
        update: {
          $inc: {
            inventoryReserved: item.quantity
          }
        }
      }
    }));

    if (bulkWriteOperations.length === 0) return;

    await SimpleInventory.bulkWrite(bulkWriteOperations, { ordered: false })
      .then(() => (
        Promise.all(allOrderItems.map((item) => (
          appEvents.emit("afterInventoryUpdate", {
            productConfiguration: {
              productId: item.productId,
              productVariantId: item.variantId
            },
            updatedBy: null
          })
        )))
      ))
      .catch((error) => {
        Logger.error(error, "Bulk write error in simple-inventory afterOrderCreate listener");
      });
  });

  // TODO: When the approval step is removed, change this to afterFulfillmentGroupPacked
  appEvents.on("afterOrderApprovePayment", async ({ order }) => {
    // We only decrease the inventory quantity after the final payment is approved
    if (!orderIsApproved(order)) return;

    const allOrderItems = getAllOrderItems(order);

    const bulkWriteOperations = allOrderItems.map((item) => ({
      updateOne: {
        filter: {
          "productConfiguration.productVariantId": item.variantId
        },
        update: {
          $inc: {
            inventoryInStock: -item.quantity,
            inventoryReserved: -item.quantity
          }
        }
      }
    }));

    if (bulkWriteOperations.length === 0) return;

    await SimpleInventory.bulkWrite(bulkWriteOperations, { ordered: false })
      .then(() => (
        Promise.all(allOrderItems.map((item) => (
          appEvents.emit("afterInventoryUpdate", {
            productConfiguration: {
              productId: item.productId,
              productVariantId: item.variantId
            },
            updatedBy: null
          })
        )))
      ))
      .catch((error) => {
        Logger.error(error, "Bulk write error in simple-inventory afterOrderApprovePayment listener");
      });
  });
}
