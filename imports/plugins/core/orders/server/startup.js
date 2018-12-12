import Hooks from "@reactioncommerce/hooks";
import { Meteor } from "meteor/meteor";
import { ReactionProduct } from "/lib/api";
import { Products } from "/lib/collections";
import rawCollections from "/imports/collections/rawCollections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import updateCatalogProductInventoryStatus from "/imports/plugins/core/catalog/server/no-meteor/utils/updateCatalogProductInventoryStatus";
import appEvents from "/imports/node-app/core/util/appEvents";
import sendOrderEmail from "/imports/plugins/core/orders/server/util/sendOrderEmail";


/**
*  Step 3 of the "workflow/pushOrderWorkflow" flow
*
*  The following methods are called from Orders.before.update hook.
*  @see packages/reaction-schema/common/hooks/orders.js
*  @see packages/reaction-core/common/methods/workflow.js
*/

/**
 * @summary Updates an order's workflow before persisting order.
 *
 * @param {Order} order - Order object, before any modifications
 * @param {Object} options - Includes userId, modifier and validation
 * @return {Boolean} true if document should be updated, false otherwise
 * @private
*/
Hooks.Events.add("beforeUpdateOrderWorkflow", (order, options) => {
  const { userId, modifier } = options;
  // if we're adding a new product or variant to the cart
  if (modifier.$set) {
    // Updating status of order e.g. "coreOrderWorkflow/processing"
    if (modifier.$set["workflow.status"]) {
      const status = modifier.$set["workflow.status"];
      const workflowMethod = `workflow/${status}`;

      if (Meteor.server.method_handlers[workflowMethod]) {
        const result = Meteor.call(workflowMethod, {
          userId,
          order,
          modifier
        });
        // Result should be true / false to all or disallow updating the status
        return result;
      }
    }
  }
});

appEvents.on("afterOrderCreate", (order) => sendOrderEmail(order));

// TODO: EK - Is this the right way to do this?
appEvents.on("afterOrderCreate", (order) => {
  const shopId = Reaction.getShopId();
  const orderItems = order.shipping.reduce((list, group) => [...list, ...group.items], []);

  orderItems.forEach((item) => {
    if (item.shopId === shopId) {
      Products.update(
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

      // Publish inventory updates to the Catalog
      Promise.await(updateCatalogProductInventoryStatus(item.productId, rawCollections));
    }
  });
});
