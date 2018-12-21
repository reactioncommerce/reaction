import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import ReactionError from "@reactioncommerce/reaction-error";
import { Orders, Products } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import rawCollections from "/imports/collections/rawCollections";
import createNotification from "/imports/plugins/included/notifications/server/no-meteor/createNotification";
import updateCatalogProductInventoryStatus from "/imports/plugins/core/catalog/server/no-meteor/utils/updateCatalogProductInventoryStatus";

/**
 * @name orders/cancelOrder
 * @method
 * @memberof Orders/Methods
 * @summary Start the cancel order process
 * @param {Object} order - order object
 * @param {Boolean} returnToStock - condition to return product to stock
 * @return {Object} ret
 */
export default function cancelOrder(order, returnToStock) {
  check(order, Object);
  check(returnToStock, Boolean);

  // REVIEW: Only marketplace admins should be able to cancel entire order?
  // Unless order is entirely contained in a single shop? Do we need a switch on marketplace owner dashboard?
  if (!Reaction.hasPermission("orders")) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  // Inventory is removed from stock only once an order has been approved
  // This is indicated by payment.status being anything other than `created`
  // We need to check to make sure the inventory has been removed before we return it to stock
  const orderIsApproved = !Array.isArray(order.payments) || order.payments.length === 0 ||
    !!order.payments.find((payment) => payment.status !== "created");

  if (returnToStock && orderIsApproved) {
    // Run this Product update inline instead of using ordersInventoryAdjust because the collection hooks fail
    // in some instances which causes the order not to cancel
    const orderItems = order.shipping.reduce((list, group) => [...list, ...group.items], []);
    orderItems.forEach((item) => {
      if (Reaction.hasPermission("orders", Reaction.getUserId(), item.shopId)) {
        Products.update(
          {
            _id: item.variantId,
            shopId: item.shopId
          },
          {
            $inc: {
              inventoryQuantity: +item.quantity
            }
          },
          {
            bypassCollection2: true,
            publish: true
          }
        );

        // Publish inventory updates to the Catalog
        Promise.await(updateCatalogProductInventoryStatus(item.productId, rawCollections));
      }
    });
  }

  // refund payment to customer
  (order.payments || []).forEach((payment) => {
    Meteor.call("orders/refunds/create", order._id, payment._id, payment.amount);
  });

  // update item workflow
  const orderItemIds = order.shipping.reduce((list, group) => [...list, ...group.items], []).map((item) => item._id);
  Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/canceled", order, orderItemIds);

  const result = Orders.update({
    _id: order._id
  }, {
    $set: {
      "workflow.status": "coreOrderWorkflow/canceled"
    },
    $push: {
      "workflow.workflow": "coreOrderWorkflow/canceled"
    }
  });

  // send notification to user
  const { accountId } = order;
  const prefix = Reaction.getShopPrefix();
  const url = `${prefix}/notifications`;
  createNotification(rawCollections, { accountId, type: "orderCanceled", url }).catch((error) => {
    Logger.error("Error in createNotification within shipmentShipped", error);
  });

  return result;
}
