import { isEqual } from "lodash";
import appEvents from "/imports/node-app/core/util/appEvents";
import applyTaxesToFulfillmentGroup from "./mutations/applyTaxesToFulfillmentGroup";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup({ collections }) {
  const { Cart } = collections;

  appEvents.on("afterCartUpdate", async (cartId, cart) => {
    const shipping = await Promise.all(cart.shipping.map(async (group) => applyTaxesToFulfillmentGroup({
      ...group,
      items: group.itemIds.map((itemId) => cart.items.find((item) => item._id === itemId))
    })));

    const cartItems = cart.items.map((item) => {
      const newItem = { ...item, taxRate: 0, tax: 0 };
      shipping.forEach((group) => {
        group.items.forEach((groupItem) => {
          if (groupItem._id === item._id) {
            newItem.taxRate = groupItem.taxRate;
            newItem.tax = groupItem.tax;
          }
        });
      });
      return newItem;
    });

    shipping.forEach((group) => {
      delete group.items;
    });

    if (isEqual(shipping, cart.shipping) && isEqual(cartItems, cart.items)) return;

    const { matchedCount } = await Cart.updateOne({ _id: cart._id }, {
      $set: {
        items: cartItems,
        shipping
      }
    });
    if (matchedCount === 0) throw new Error("Unable to update cart");
  });
}
