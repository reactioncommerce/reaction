/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { appEvents, collections } = context;

  appEvents.on("afterOrderCancel", async ({ order, returnToStock }) => {
    // Inventory is removed from stock only once an order has been approved
    // This is indicated by payment.status being anything other than `created`
    // We need to check to make sure the inventory has been removed before we return it to stock
    const orderIsApproved = !Array.isArray(order.payments) || order.payments.length === 0 ||
      !!order.payments.find((payment) => payment.status !== "created");

    // If order is approved, the inventory has been taken away from both `inventoryInStock` and `inventoryAvailableToSell`
    if (returnToStock && orderIsApproved) {
      // Run this Product update inline instead of using ordersInventoryAdjust because the collection hooks fail
      // in some instances which causes the order not to cancel
      const orderItems = order.shipping.reduce((list, group) => [...list, ...group.items], []);
      orderItems.forEach(async (item) => {
        const { value: updatedItem } = await collections.Products.findOneAndUpdate(
          {
            _id: item.variantId
          },
          {
            $inc: {
              inventoryAvailableToSell: +item.quantity,
              inventoryInStock: +item.quantity
            }
          }, {
            returnOriginal: false
          }
        );

        // Update parents of supplied item
        await collections.Products.updateMany(
          {
            _id: { $in: updatedItem.ancestors }
          },
          {
            $inc: {
              inventoryAvailableToSell: +item.quantity,
              inventoryInStock: +item.quantity
            }
          }
        );
      });
    }

    // If order is not approved, the inventory hasn't been taken away from `inventoryInStock`, but has been taken away from `inventoryAvailableToSell`
    if (!orderIsApproved) {
    // Run this Product update inline instead of using ordersInventoryAdjust because the collection hooks fail
    // in some instances which causes the order not to cancel
      const orderItems = order.shipping.reduce((list, group) => [...list, ...group.items], []);
      orderItems.forEach(async (item) => {
        const { value: updatedItem } = await collections.Products.findOneAndUpdate(
          {
            _id: item.variantId
          },
          {
            $inc: {
              inventoryAvailableToSell: +item.quantity
            }
          }, {
            returnOriginal: false
          }
        );

        // Update parents of supplied item
        await collections.Products.updateMany(
          {
            _id: { $in: updatedItem.ancestors }
          },
          {
            $inc: {
              inventoryAvailableToSell: +item.quantity
            }
          }
        );
      });
    }
  });

  appEvents.on("afterOrderCreate", async ({ order }) => {
    const orderItems = order.shipping.reduce((list, group) => [...list, ...group.items], []);

    // Create a new set of unique productIds
    // We do this because variants might have the same productId
    // and we don't want to update the product each time a variant is it's child
    // we can map over the unique productIds at the end, and update each one once
    orderItems.forEach(async (item) => {
      // Update supplied item inventory
      const { value: updatedItem } = await collections.Products.findOneAndUpdate(
        {
          _id: item.variantId
        },
        {
          $inc: {
            inventoryAvailableToSell: -item.quantity
          }
        }, {
          returnOriginal: false
        }
      );

      // Update supplied item inventory
      await collections.Products.updateMany(
        {
          _id: { $in: updatedItem.ancestors }
        },
        {
          $inc: {
            inventoryAvailableToSell: -item.quantity
          }
        }
      );
    });
  });

  appEvents.on("afterOrderApprovePayment", async ({ order }) => {
    // We only decrease the inventory quantity after the final payment is approved
    const nonApprovedPayment = (order.payments || []).find((payment) => payment.status === "created");
    if (nonApprovedPayment) return;

    const orderItems = order.shipping.reduce((list, group) => [...list, ...group.items], []);

    // Create a new set of unique productIds
    // We do this because variants might have the same productId
    // and we don't want to update the product each time a variant is it's child
    // we can map over the unique productIds at the end, and update each one once
    orderItems.forEach(async (item) => {
      // Update supplied item inventory
      const { value: updatedItem } = await collections.Products.findOneAndUpdate(
        {
          _id: item.variantId
        },
        {
          $inc: {
            inventoryInStock: -item.quantity
          }
        }, {
          returnOriginal: false
        }
      );

      // Update supplied item inventory
      await collections.Products.updateMany(
        {
          _id: { $in: updatedItem.ancestors }
        },
        {
          $inc: {
            inventoryInStock: -item.quantity
          }
        }
      );
    });
  });
}
