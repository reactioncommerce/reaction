import Hooks from "@reactioncommerce/hooks";
import accounting from "accounting-js";
import { check } from "meteor/check";
import ReactionError from "@reactioncommerce/reaction-error";
import { Orders, Products } from "/lib/collections";
import rawCollections from "/imports/collections/rawCollections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import getTopLevelVariant from "/imports/plugins/core/catalog/server/no-meteor/utils/getTopLevelVariant";
import getProductInventoryInStockQuantity from "/imports/plugins/core/catalog/server/no-meteor/utils/getProductInventoryInStockQuantity";
import getVariantInventoryInStockQuantity from "/imports/plugins/core/catalog/server/no-meteor/utils/getVariantInventoryInStockQuantity";
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
    throw new ReactionError("access-denied", "Access Denied");
  }

  const order = Orders.findOne({ _id: orderId });
  const orderItems = order.shipping.reduce((list, group) => [...list, ...group.items], []);
  orderItems.forEach(async (item) => {
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

      // Check to see if this item is the top level variant, or an option
      const topLevelVariant = await getTopLevelVariant(item.variantId, rawCollections);

      // If item is an option, update the quantity on its parent variant too
      if (topLevelVariant._id !== item.variantId) {
        const variantInventoryInStockQuantity = await getVariantInventoryInStockQuantity(topLevelVariant, rawCollections);

        await rawCollections.Products.updateOne(
          {
            _id: topLevelVariant._id
          },
          {
            $set: {
              inventoryQuantity: variantInventoryInStockQuantity
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
      const productInventoryInStockQuantity = await getProductInventoryInStockQuantity(item.productId, rawCollections);
      await rawCollections.Products.updateOne(
        {
          _id: item.productId
        },
        {
          $set: {
            inventoryQuantity: productInventoryInStockQuantity
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
  const { invoice } = orderCreditMethod(order);

  // REVIEW: Who should have access to do this for a marketplace?
  // Do we have/need a shopId on each order?
  if (!Reaction.hasPermission("orders")) {
    throw new ReactionError("access-denied", "Access Denied");
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
      "shipping.shopId": shopId,
      "shipping.payment.method": "credit"
    },
    {
      $set: {
        "shipping.$.payment.amount": total,
        "shipping.$.payment.status": "approved",
        "shipping.$.payment.mode": "capture",
        "shipping.$.payment.invoice.discounts": discounts,
        "shipping.$.payment.invoice.total": Number(total)
      }
    }
  );

  // Update search record
  Hooks.Events.run("afterUpdateOrderUpdateSearchRecord", order);

  return result;
}
