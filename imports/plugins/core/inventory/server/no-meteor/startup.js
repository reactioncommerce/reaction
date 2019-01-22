import updateCatalogProductInventoryStatus from "/imports/plugins/core/catalog/server/no-meteor/utils/updateCatalogProductInventoryStatus";
import getVariantInventoryNotAvailableToSellQuantity from "./utils/getVariantInventoryNotAvailableToSellQuantity";
import updateParentVariantsInventoryAvailableToSellQuantity from "./utils/updateParentVariantsInventoryAvailableToSellQuantity";
import updateParentVariantsInventoryInStockQuantity from "./utils/updateParentVariantsInventoryInStockQuantity";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { appEvents } = context;

  appEvents.on("afterOrderCancel", async ({ order, returnToStock }) => {
    const { collections } = context;

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

      // Publish inventory updates to the Catalog
      // Since variants share the same productId, we only want to update each product once
      // So we use a Set to get all unique productIds that were affected, then loop through that data
      const productIds = [...new Set(orderItems.map((item) => item.productId))];
      productIds.forEach(async (productId) => {
        await updateCatalogProductInventoryStatus(productId, collections);
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

      // Publish inventory updates to the Catalog
      // Since variants share the same productId, we only want to update each product once
      // So we use a Set to get all unique productIds that were affected, then loop through that data
      const productIds = [...new Set(orderItems.map((item) => item.productId))];
      productIds.forEach(async (productId) => {
        await updateCatalogProductInventoryStatus(productId, collections);
      });
    }
  });

  appEvents.on("afterOrderCreate", async (order) => {
    const { collections } = context;
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

    // Publish inventory updates to the Catalog
    // Since variants share the same productId, we only want to update each product once
    // So we use a Set to get all unique productIds that were affected, then loop through that data
    const productIds = [...new Set(orderItems.map((item) => item.productId))];
    productIds.forEach(async (productId) => {
      await updateCatalogProductInventoryStatus(productId, collections);
    });
  });

  appEvents.on("afterOrderApprovePayment", async (order) => {
    const { collections } = context;

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

    // Publish inventory updates to the Catalog
    // Since variants share the same productId, we only want to update each product once
    // So we use a Set to get all unique productIds that were affected, then loop through that data
    const productIds = [...new Set(orderItems.map((item) => item.productId))];
    productIds.forEach(async (productId) => {
      await updateCatalogProductInventoryStatus(productId, collections);
    });
  });

  appEvents.on("afterVariantUpdate", async ({ _id, field }) => {
    const { collections } = context;

    // If the updated field was `inventoryInStock`, adjust `inventoryAvailableToSell` quantities
    if (field === "inventoryInStock") {
      const doc = await collections.Products.findOne({ _id });

      // Get reserved inventory - the inventory currently in an unprocessed order
      const reservedInventory = await getVariantInventoryNotAvailableToSellQuantity(doc, collections);

      // Compute `inventoryAvailableToSell` as the inventory in stock minus the reserved inventory
      const computedInventoryAvailableToSell = doc.inventoryInStock - reservedInventory;

      await collections.Products.updateOne(
        {
          _id: doc._id
        },
        {
          $set: {
            inventoryAvailableToSell: computedInventoryAvailableToSell
          }
        }
      );

      // Update `inventoryAvailableToSell` on all parents of this variant / option
      await updateParentVariantsInventoryAvailableToSellQuantity(doc, collections);
      // Update `inventoryInStock` on all parents of this variant / option
      await updateParentVariantsInventoryInStockQuantity(doc, collections);

      // Publish inventory to catalog
      await updateCatalogProductInventoryStatus(doc.ancestors[0], collections);
    }
  });
}
