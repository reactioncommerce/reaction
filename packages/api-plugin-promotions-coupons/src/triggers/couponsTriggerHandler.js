import { CouponTriggerParameters } from "../simpleSchemas.js";

/**
 * @summary a no-op function for testing of promotions
 * @param {Object} context - The application context
 * @param {Object} enhancedCart - The cart to apply promotions to
 * @param {Object} trigger - The parameters to pass to the trigger
 * @returns {Boolean} - Whether the promotion can be applied to the cart
 */
export async function couponTriggerHandler(context, enhancedCart, { triggerParameters }) {
  return triggerParameters.couponCode === "code";
}

export default {
  key: "coupons",
  handler: couponTriggerHandler,
  paramSchema: CouponTriggerParameters
};
