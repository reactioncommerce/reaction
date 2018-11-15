import getSurcharges from "./getSurcharges";

const EMITTED_BY_NAME = "SURCHARGES_PLUGIN";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @returns {undefined}
 */
export default function startup(context) {
  const { appEvents, collections } = context;
  const { Cart, Orders } = collections;

  // Adds Surcharges collection to context
  collections.Surcharges = context.app.db.collection("Surcharges");

  // Update the cart to include surcharges, if applicable
  appEvents.on("afterCartUpdate", async (cart, { emittedBy } = {}) => {
    if (emittedBy === EMITTED_BY_NAME) return; // short circuit infinite loops

    const cartSurcharges = await getSurcharges(context, cart);

    const { value: updatedCart } = await Cart.findOneAndUpdate({ _id: cart._id }, {
      $set: {
        surcharges: cartSurcharges
      }
    }, {
      // Default behavior is to return the original. We want the updated.
      returnOriginal: false
    });

    appEvents.emit("afterCartUpdate", updatedCart, { emittedBy: EMITTED_BY_NAME });
  });

  // Update the order to include surcharges, if applicable
  appEvents.on("afterOrderCreate", async (order, { emittedBy } = {}) => {
    if (emittedBy === EMITTED_BY_NAME) return;

    const orderSurcharges = await getSurcharges(context, order);

    const { value: updatedOrder } = await Orders.findOneAndUpdate({ _id: order._id }, {
      $set: {
        surcharges: orderSurcharges
      }
    }, {
      // Default behavior is to return the original. We want the updated.
      returnOriginal: false
    });

    appEvents.emit("afterOrderUpdate", updatedOrder, { emittedBy: EMITTED_BY_NAME });
  });
}
