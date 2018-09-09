import Logger from "@reactioncommerce/logger";
import appEvents from "/imports/node-app/core/util/appEvents";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup({ collections }) {
  appEvents.on("afterOrderCreate", async (order) => {
    const { cartId } = order;
    if (cartId) {
      const { result } = await collections.Cart.deleteOne({ _id: cartId });
      if (result.ok !== 1) {
        Logger.warn(`MongoDB error trying to delete cart ${cartId} in "afterOrderCreate" listener. Check MongoDB logs.`);
      }
    }
  });
}
