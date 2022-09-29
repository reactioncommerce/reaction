import applyImplicitPromotions from "./handlers/applyImplicitPromotions.js";
import applyExplicitCoupons from './handlers/applyExplicitCoupons.js'

/**
 * @summary Perform various scaffolding tasks on startup
 * @param {Object} context - The application context
 * @returns {Promise<void>} undefined
 */
export default async function startupPromotions(context) {
  context.appEvents.on("afterCartCreate", async (args) => {
    const { cart, emittedBy } = args;
    if (emittedBy !== "promotions") {
      await applyImplicitPromotions(context, cart);
    }
  });

  context.appEvents.on("afterCartUpdate", async (args) => {
    const { cart, emittedBy } = args;
    if (emittedBy !== "promotions") {
      await applyImplicitPromotions(context, cart);
    }
  });

  context.appEvents.on('applyCouponToCart', async (args) => {
    const {cart, promotions} = args;
    await applyExplicitCoupons(context, cart, promotions);
  })
}
