import Hooks from "@reactioncommerce/hooks";
import accounting from "accounting-js";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Orders, Products } from "/lib/collections";
import rawCollections from "/imports/collections/rawCollections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import updateCatalogProductInventoryStatus from "/imports/plugins/core/catalog/server/no-meteor/utils/updateCatalogProductInventoryStatus";
import orderCreditMethod from "../util/orderCreditMethod";

/**
 * @name ordersInventoryAdjustByShop
 * @method
 * @private
 * @summary Adjust inventory for a particular shop when an order is approved
 * @todo Marketplace: Is there a reason to do this any other way? Can admins reduce for more than one shop?
 * @param {String} orderId - orderId
 * @param {String} shopId - the id of the shop approving the order
 * @return {null} no return value
 */
function ordersInventoryAdjustByShop(orderId, shopId) {
  check(orderId, String);
  check(shopId, String);

  if (!Reaction.hasPermission("orders")) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  const order = Orders.findOne(orderId);
  order.items.forEach((item) => {
    if (item.shopId === shopId) {
      Products.update(
        {
          _id: item.variants._id
        },
        {
          $inc: {
            inventoryQuantity: -item.quantity
          }
        },
        {
          publish: true,
          selector: {
            type: "variant"
          }
        }
      );

      Hooks.Events.run("afterUpdateCatalogProduct", item.variants);

      // Publish inventory updates to the Catalog
      Promise.await(updateCatalogProductInventoryStatus(item.productId, rawCollections));
    }
  });
}

/**
 * @name orders/approvePayment
 * @method
 * @memberof Orders/Methods
 * @summary Approve payment and apply any adjustments
 * @param {Object} order - order object
 * @return {Object} return this.processPayment result
 */
export default function approvePayment(order) {
  check(order, Object);
  const { invoice } = orderCreditMethod(order);

  // REVIEW: Who should have access to do this for a marketplace?
  // Do we have/need a shopId on each order?
  if (!Reaction.hasPermission("orders")) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  this.unblock(); // REVIEW: why unblock here?

  // this is server side check to verify
  // that the math all still adds up.
  const shopId = Reaction.getShopId();
  const { discounts, shipping, subtotal, taxes } = invoice;
  const discountTotal = Math.max(0, subtotal - discounts); // ensure no discounting below 0.
  const total = accounting.toFixed(Number(discountTotal) + Number(shipping) + Number(taxes), 2);

  // Updates flattened inventory count on variants in Products collection
  ordersInventoryAdjustByShop(order._id, shopId);

  const result = Orders.update(
    {
      "_id": order._id,
      "billing.shopId": shopId,
      "billing.paymentMethod.method": "credit"
    },
    {
      $set: {
        "billing.$.paymentMethod.amount": total,
        "billing.$.paymentMethod.status": "approved",
        "billing.$.paymentMethod.mode": "capture",
        "billing.$.invoice.discounts": discounts,
        "billing.$.invoice.total": Number(total)
      }
    }
  );

  // Update search record
  Hooks.Events.run("afterUpdateOrderUpdateSearchRecord", order);

  return result;
}
