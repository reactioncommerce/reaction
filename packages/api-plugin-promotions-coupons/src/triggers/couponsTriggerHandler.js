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
  // TODO: add the logic to check ownership or limitation of the coupon
  return true;
}

export default {
  key: "coupons",
  handler: couponTriggerHandler,
  paramSchema: CouponTriggerParameters,
  triggerType: "explicit"
};
