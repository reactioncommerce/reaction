import { isEqual } from "lodash";
import Logger from "@reactioncommerce/logger";
import getUpdatedCartItems from "./util/getUpdatedCartItems";

const EMITTED_BY_NAME = "TAXES_CORE_PLUGIN";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default function startup(context) {
  const { appEvents, collections } = context;
  const { Cart } = collections;

  // This entire hook is doing just one thing: Updating the tax-related props
  // on each item in the cart, and saving those changes to the database if any of them
  // have changed.
  appEvents.on("afterCartUpdate", async ({ cart }, { emittedBy } = {}) => {
    if (emittedBy === EMITTED_BY_NAME) return; // short circuit infinite loops
    Logger.debug("Handling afterCartUpdate: taxes");

    const { cartItems, taxSummary } = await getUpdatedCartItems(context, cart);

    if (isEqual(cartItems, cart.items) && isEqual(taxSummary, cart.taxSummary)) return;

    const { matchedCount } = await Cart.updateOne({ _id: cart._id }, {
      $set: {
        items: cartItems,
        taxSummary
      }
    });
    if (matchedCount === 0) throw new Error("Unable to update cart");

    appEvents.emit("afterCartUpdate", { cart: { ...cart, items: cartItems, taxSummary }, updatedBy: null }, { emittedBy: EMITTED_BY_NAME });
  });
}
