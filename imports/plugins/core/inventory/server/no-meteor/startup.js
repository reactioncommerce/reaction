
import rawCollections from "/imports/collections/rawCollections";
import updateCatalogProductInventoryStatus from "/imports/plugins/core/catalog/server/no-meteor/utils/updateCatalogProductInventoryStatus";
import appEvents from "/imports/node-app/core/util/appEvents";
import updateParentVariantsInventoryAvailableToSellQuantity from "/imports/plugins/core/inventory/server/no-meteor/utils/updateParentVariantsInventoryAvailableToSellQuantity";

/**

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  appEvents.on("afterOrderCreate", async (order) => {
    const { collections } = context;
    const orderItems = order.shipping.reduce((list, group) => [...list, ...group.items], []);

    orderItems.forEach(async (item) => {
      // Update supplied item inventory
      await collections.Products.updateOne(
        {
          _id: item.variantId
        },
        {
          $inc: {
            inventoryAvailableToSell: -item.quantity
          }
        },
        {
          publish: true,
          selector: {
            type: "variant"
          }
        }
      );

      // Update `inventoryQuantity` on all parents of this variant / option
      Promise.await(updateParentVariantsInventoryAvailableToSellQuantity(item, rawCollections));

      // Publish inventory updates to the Catalog
      Promise.await(updateCatalogProductInventoryStatus(item.productId, rawCollections));
    });
  });
}
