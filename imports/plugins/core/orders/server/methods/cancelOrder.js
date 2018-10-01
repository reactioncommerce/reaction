import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import ReactionError from "@reactioncommerce/reaction-error";
import { Orders, Products, Packages } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import rawCollections from "/imports/collections/rawCollections";
import createNotification from "/imports/plugins/included/notifications/server/no-meteor/createNotification";
import updateCatalogProductInventoryStatus from "/imports/plugins/core/catalog/server/no-meteor/utils/updateCatalogProductInventoryStatus";
import orderCreditMethod from "../util/orderCreditMethod";

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
  const orderIsApproved = order.shipping.find((group) => group.payment.status !== "created");

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

  const { _id: paymentId, invoice, paymentPluginName } = orderCreditMethod(order);
  const shippingRecord = order.shipping.find((shipping) => shipping.shopId === Reaction.getShopId());
  const { itemIds } = shippingRecord;

  const invoiceTotal = invoice.total;

  // refund payment to customer
  const paymentPlugin = Packages.findOne({ name: paymentPluginName, shopId: order.shopId });
  const isRefundable =
    paymentPlugin &&
    paymentPlugin.settings &&
    paymentPlugin.settings[paymentPluginName] &&
    paymentPlugin.settings[paymentPluginName].support.includes("Refund");

  if (isRefundable) {
    Meteor.call("orders/refunds/create", order._id, paymentId, Number(invoiceTotal));
  }

  // send notification to user
  const { accountId } = order;
  const prefix = Reaction.getShopPrefix();
  const url = `${prefix}/notifications`;
  createNotification(rawCollections, { accountId, type: "orderCanceled", url }).catch((error) => {
    Logger.error("Error in createNotification within shipmentShipped", error);
  });

  // update item workflow
  Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/canceled", order, itemIds);

  return Orders.update(
    {
      "_id": order._id,
      "shipping.shopId": Reaction.getShopId(),
      "shipping.payment.method": "credit"
    },
    {
      $set: {
        "workflow.status": "coreOrderWorkflow/canceled",
        "shipping.$.payment.mode": "cancel"
      },
      $push: {
        "workflow.workflow": "coreOrderWorkflow/canceled"
      }
    }
  );
}
