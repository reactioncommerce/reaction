
import rawCollections from "/imports/collections/rawCollections";
import updateCatalogProductInventoryStatus from "/imports/plugins/core/catalog/server/no-meteor/utils/updateCatalogProductInventoryStatus";
import appEvents from "/imports/node-app/core/util/appEvents";
import getTopLevelVariant from "/imports/plugins/core/catalog/server/no-meteor/utils/getTopLevelVariant";
import getProductInventoryAvailableToSellQuantity from "/imports/plugins/core/catalog/server/no-meteor/utils/getProductInventoryAvailableToSellQuantity";
import getVariantInventoryAvailableToSellQuantity from "/imports/plugins/core/catalog/server/no-meteor/utils/getVariantInventoryAvailableToSellQuantity";

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

      // Check to see if this item is the top level variant, or an option
      const topLevelVariant = await getTopLevelVariant(item.variantId, collections);

      // If item is an option, update the quantity on its parent variant too
      if (topLevelVariant._id !== item.variantId) {
        const variantInventoryAvailableToSellQuantity = await getVariantInventoryAvailableToSellQuantity(topLevelVariant, context.collections);

        await collections.Products.updateOne(
          {
            _id: topLevelVariant._id
          },
          {
            $set: {
              inventoryAvailableToSell: variantInventoryAvailableToSellQuantity
            }
          },
          {
            publish: true,
            selector: {
              type: "variant"
            }
          }
        );
      }

      // Update the top level product to be the sum of all variant inventory numbers
      const productInventoryAvailableToSellQuantity = await getProductInventoryAvailableToSellQuantity(item.productId, context.collections);
      await collections.Products.updateOne(
        {
          _id: item.productId
        },
        {
          $set: {
            inventoryAvailableToSell: productInventoryAvailableToSellQuantity
          }
        },
        {
          publish: true,
          selector: {
            type: "variant"
          }
        }
      );

      // Publish inventory updates to the Catalog
      Promise.await(updateCatalogProductInventoryStatus(item.productId, rawCollections));
    });
  });
}
