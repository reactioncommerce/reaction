import appEvents from "/imports/node-app/core/util/appEvents";
import getDiscountsTotalForCart from "/imports/plugins/core/discounts/server/no-meteor/util/getDiscountsTotalForCart";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { Cart } = context.collections;

  appEvents.on("afterCartUpdate", async ({ cart }) => {
    if (!cart) {
      throw new Error("afterCartUpdate hook run with no cart argument");
    }

    const cartId = cart._id;
    const { total: discount } = await getDiscountsTotalForCart(context, cartId);
    if (discount !== cart.discount) {
      await Cart.update({ _id: cartId }, { $set: { discount } });
    }
  });
}
