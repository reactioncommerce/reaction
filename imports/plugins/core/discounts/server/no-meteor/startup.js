import Logger from "@reactioncommerce/logger";
import collectionIndex from "/imports/utils/collectionIndex";
import getDiscountsTotalForCart from "/imports/plugins/core/discounts/server/no-meteor/util/getDiscountsTotalForCart";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { appEvents, collections } = context;
  const { Cart, Discounts } = collections;

  // Create indexes. We set specific names for backwards compatibility
  // with indexes created by the aldeed:schema-index Meteor package.
  collectionIndex(Discounts, { shopId: 1 }, { name: "c2_shopId" });

  appEvents.on("afterCartUpdate", async ({ cart }) => {
    if (!cart) {
      throw new Error("afterCartUpdate hook run with no cart argument");
    }
    Logger.debug("Handling afterCartUpdate: discounts");

    const { total: discount } = await getDiscountsTotalForCart(context, cart);
    if (discount !== cart.discount) {
      await Cart.update({ _id: cart._id }, { $set: { discount } });
    }
  });
}
