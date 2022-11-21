/**
 * @summary check if a promotion is applicable to a cart
 * @param {Object} context - The application context
 * @param {Object} cart - The cart we are trying to apply the promotion to
 * @param {Array<Object>} params.appliedThe - The promotions already applied
 * @param {Object} params.promotion - The promotion we are trying to apply
 * @param {Object} params.stackAbilityByKey - The stack ability by key
 * @returns {Boolean} - Whether the promotion can be applied to the cart
 */
export default async function checkStackAbility(context, cart, { appliedPromotions, promotion, stackAbilityByKey }) {
  if (appliedPromotions.length === 0) return true;

  for (const appliedPromotion of appliedPromotions) {
    if (!appliedPromotion.stackAbility) continue;

    const stackAbilityHandler = stackAbilityByKey[promotion.stackAbility.key];
    const appliedStackAbilityHandler = stackAbilityByKey[appliedPromotion.stackAbility.key];
    // eslint-disable-next-line no-await-in-loop
    if (!(await stackAbilityHandler.handler(context, cart, { promotion, appliedPromotion }))) {
      return false;
    }
    // eslint-disable-next-line no-await-in-loop
    if (!(await appliedStackAbilityHandler.handler(context, cart, { promotion: appliedPromotion, appliedPromotion: promotion }))) {
      return false;
    }
  }

  return true;
}
