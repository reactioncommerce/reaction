import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import ReactionError from "@reactioncommerce/reaction-error";
import { Orders, Products, Packages } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import rawCollections from "/imports/collections/rawCollections";
import createNotification from "/imports/plugins/included/notifications/server/no-meteor/createNotification";
import updateCatalogProductInventoryStatus from "/imports/plugins/core/catalog/server/no-meteor/utils/updateCatalogProductInventoryStatus";
import updateParentVariantsInventoryAvailableToSellQuantity from "/imports/plugins/core/inventory/server/no-meteor/utils/updateParentVariantsInventoryAvailableToSellQuantity";
import updateParentVariantsInventoryInStockQuantity from "/imports/plugins/core/inventory/server/no-meteor/utils/updateParentVariantsInventoryInStockQuantity";
import orderCreditMethod from "../util/orderCreditMethod";
import appEvents from "/imports/node-app/core/util/appEvents";


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

  const { _id: paymentId, invoice, paymentPluginName } = orderCreditMethod(order);
  const shippingRecord = order.shipping.find((shipping) => shipping.shopId === Reaction.getShopId());
  const { itemIds } = shippingRecord;

  const invoiceTotal = invoice.total;

  // refund payment to customer
  const paymentPlugin = Packages.findOne({ name: paymentPluginName, shopId: order.shopId });
  const isRefundable = (_.get(paymentPlugin, "settings.support", []).indexOf("Refund") > -1);

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

  Promise.await(appEvents.emit("afterOrderCancel", order, returnToStock));

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
