import { isEqual } from "lodash";
import Logger from "@reactioncommerce/logger";
import xformCartGroupToCommonOrder from "/imports/plugins/core/cart/server/no-meteor/util/xformCartGroupToCommonOrder";
import collectionIndex from "/imports/utils/collectionIndex";
import getSurcharges from "./getSurcharges";

const EMITTED_BY_NAME = "SURCHARGES_PLUGIN";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default function startup(context) {
  const { appEvents, collections } = context;
  const { Cart } = collections;

  // Adds Surcharges collection to context
  collections.Surcharges = context.app.db.collection("Surcharges");
  collectionIndex(collections.Surcharges, { shopId: 1 });

  // Update the cart to include surcharges, if applicable
  appEvents.on("afterCartUpdate", async ({ cart }, { emittedBy } = {}) => {
    if (emittedBy === EMITTED_BY_NAME) return; // short circuit infinite loops
    Logger.debug("Handling afterCartUpdate: surcharges");

    const { shipping } = cart;
    const cartSurcharges = [];

    // Merge surcharges from each shipping group
    for (const shippingGroup of shipping) {
      const commonOrder = await xformCartGroupToCommonOrder(cart, shippingGroup, context); // eslint-disable-line
      const appliedSurcharges = await getSurcharges(context, { commonOrder }); // eslint-disable-line

      appliedSurcharges.forEach((appliedSurcharge) => {
        // Push shippingGroup surcharges to cart surcharge array
        cartSurcharges.push(appliedSurcharge);
      });
    }

    // To avoid infinite looping among various `afterCartUpdate` handlers that also
    // update cart and emit a subsequent `afterCartUpdate`, we need to be sure we
    // do not do the update or emit the event unless we truly need to update something.
    const previousSurcharges = cart.surcharges.map((appliedSurcharge) => ({ ...appliedSurcharge, _id: null }));
    const nextSurcharges = cartSurcharges.map((appliedSurcharge) => ({ ...appliedSurcharge, _id: null }));
    if (isEqual(previousSurcharges, nextSurcharges)) return;

    const { value: updatedCart } = await Cart.findOneAndUpdate({ _id: cart._id }, {
      $set: {
        surcharges: cartSurcharges
      }
    }, {
      // Default behavior is to return the original. We want the updated.
      returnOriginal: false
    });

    appEvents.emit("afterCartUpdate", { cart: updatedCart, updatedBy: null }, { emittedBy: EMITTED_BY_NAME });
  });
}
