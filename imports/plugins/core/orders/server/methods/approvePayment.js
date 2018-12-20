import Hooks from "@reactioncommerce/hooks";
import { check } from "meteor/check";
import ReactionError from "@reactioncommerce/reaction-error";
import { Orders, Products } from "/lib/collections";
import rawCollections from "/imports/collections/rawCollections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import updateCatalogProductInventoryStatus from "/imports/plugins/core/catalog/server/no-meteor/utils/updateCatalogProductInventoryStatus";

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
    throw new ReactionError("access-denied", "Access Denied");
  }

  const order = Orders.findOne({ _id: orderId });
  const orderItems = order.shipping.reduce((list, group) => [...list, ...group.items], []);
  orderItems.forEach((item) => {
    if (item.shopId === shopId) {
      Products.update(
        {
          _id: item.variantId
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

  const shopId = Reaction.getShopId();

  if (!Reaction.hasPermission("orders", Reaction.getUserId(), shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const dbOrder = Orders.findOne({
    _id: order._id,
    shopId
  }, {
    projection: {
      payments: 1
    }
  });
  if (!dbOrder) throw new ReactionError("not-found", "Not Found");

  if (Array.isArray(dbOrder.payments) && dbOrder.payments.length > 0) {
    // Update all payments that are in "created" status to be "approved" status
    const payments = dbOrder.payments.map((payment) => {
      let { status } = payment;

      if (status === "created") status = "approved";

      return { ...payment, status };
    });

    Orders.update({
      _id: order._id
    }, {
      $set: {
        payments
      }
    });

    // Update search record
    Hooks.Events.run("afterUpdateOrderUpdateSearchRecord", order);
  }

  // Updates flattened inventory count on variants in Products collection
  ordersInventoryAdjustByShop(order._id, shopId);
}
