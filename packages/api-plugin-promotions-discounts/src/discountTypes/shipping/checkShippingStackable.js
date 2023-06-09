/* eslint-disable no-await-in-loop */
import _ from "lodash";

/**
 * @summary check if a promotion is applicable to a cart
 * @param {Object} context - The application context
 * @param {Object} shipping - The cart we are trying to apply the promotion to
 * @param {Object} discount - The promotion we are trying to apply
 * @returns {Promise<Boolean>} - Whether the promotion is applicable to the shipping
 */
export default async function checkShippingStackable(context, shipping, discount) {
  const { promotions } = context;
  const stackabilityByKey = _.keyBy(promotions.stackabilities, "key");

  for (const appliedDiscount of shipping.discounts) {
    if (!appliedDiscount.stackability) continue;

    const stackHandler = stackabilityByKey[discount.stackability.key];
    const appliedStackHandler = stackabilityByKey[appliedDiscount.stackability.key];

    const stackResult = await stackHandler.handler(context, null, { promotion: discount, appliedPromotion: appliedDiscount });
    const appliedStackResult = await appliedStackHandler.handler(context, {}, { promotion: appliedDiscount, appliedPromotion: discount });

    if (!stackResult || !appliedStackResult) return false;
  }

  return true;
}
