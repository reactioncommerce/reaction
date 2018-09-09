import appEvents from "/imports/node-app/core/util/appEvents";
import getDiscountsTotalForCart from "/imports/plugins/core/discounts/server/no-meteor/util/getDiscountsTotalForCart";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup({ collections }) {
  const { Cart } = collections;

  appEvents.on("afterCartUpdate", async (cartId, cart) => {
    if (!cartId) {
      throw new Error("afterCartUpdate hook run with no cartId argument");
    }

    if (typeof cartId !== "string") {
      throw new Error("afterCartUpdate hook run with non-string cartId argument");
    }

    if (!cart) {
      throw new Error("afterCartUpdate hook run with no cart argument");
    }

    const { total: discount } = await getDiscountsTotalForCart(collections, cartId);
    if (discount !== cart.discount) {
      await Cart.update({ _id: cartId }, { $set: { discount } });
    }
  });
}
