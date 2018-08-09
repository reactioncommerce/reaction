import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Orders, Products, Packages } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import rawCollections from "/imports/collections/rawCollections";
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
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  // Inventory is removed from stock only once an order has been approved
  // This is indicated by order.billing.$.paymentMethod.status being anything other than `created`
  // We need to check to make sure the inventory has been removed before we return it to stock
  const orderIsApproved = order.billing.find((status) => status.paymentMethod.status !== "created");

  if (returnToStock && orderIsApproved) {
    // Run this Product update inline instead of using ordersInventoryAdjust because the collection hooks fail
    // in some instances which causes the order not to cancel
    order.items.forEach((item) => {
      if (Reaction.hasPermission("orders", Meteor.userId(), item.shopId)) {
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

  const billingRecord = order.billing.find((billing) => billing.shopId === Reaction.getShopId());
  const shippingRecord = order.shipping.find((shipping) => shipping.shopId === Reaction.getShopId());

  let { paymentMethod } = orderCreditMethod(order);
  paymentMethod = Object.assign(paymentMethod, { amount: Number(paymentMethod.amount) });
  const invoiceTotal = billingRecord.invoice.total;
  const shipment = shippingRecord;
  const itemIds = shipment.items.map((item) => item._id);

  // refund payment to customer
  const paymentMethodId = paymentMethod && paymentMethod.paymentPackageId;
  const paymentMethodName = paymentMethod && paymentMethod.paymentSettingsKey;
  const getPaymentMethod = Packages.findOne({ _id: paymentMethodId });
  const isRefundable =
    getPaymentMethod &&
    getPaymentMethod.settings &&
    getPaymentMethod.settings[paymentMethodName] &&
    getPaymentMethod.settings[paymentMethodName].support.includes("Refund");

  if (isRefundable) {
    Meteor.call("orders/refunds/create", order._id, paymentMethod, Number(invoiceTotal));
  }

  // send notification to user
  const prefix = Reaction.getShopPrefix();
  const url = `${prefix}/notifications`;
  const sms = true;
  Meteor.call("notification/send", order.accountId, "orderCanceled", url, sms, (err) => {
    if (err) Logger.error(err);
  });

  // update item workflow
  Meteor.call("workflow/pushItemWorkflow", "coreOrderItemWorkflow/canceled", order, itemIds);

  return Orders.update(
    {
      "_id": order._id,
      "billing.shopId": Reaction.getShopId(),
      "billing.paymentMethod.method": "credit"
    },
    {
      $set: {
        "workflow.status": "coreOrderWorkflow/canceled",
        "billing.$.paymentMethod.mode": "cancel"
      },
      $push: {
        "workflow.workflow": "coreOrderWorkflow/canceled"
      }
    }
  );
}
