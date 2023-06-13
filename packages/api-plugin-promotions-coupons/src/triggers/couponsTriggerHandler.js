/* eslint-disable no-unused-vars */
import { CouponTriggerParameters } from "../simpleSchemas.js";

/**
 * @summary Trigger handler for coupon
 * @param {Object} context - The application context
 * @param {Object} enhancedCart - The cart to apply promotions to
 * @param {Object} trigger - The parameters to pass to the trigger
 * @returns {Boolean} - Whether the promotion can be applied to the cart
 */
export async function couponTriggerHandler(context, enhancedCart, { triggerParameters }) {
  const { promotions: pluginPromotions } = context;
  const offerTrigger = pluginPromotions.triggers.find((trigger) => trigger.key === "offers");
  if (!offerTrigger) throw new Error("No offer trigger found. Need to register offers trigger first.");
  const triggerResult = await offerTrigger.handler(context, enhancedCart, { triggerParameters });
  return triggerResult;
}

export default {
  key: "coupons",
  handler: couponTriggerHandler,
  paramSchema: CouponTriggerParameters,
  type: "explicit"
};
