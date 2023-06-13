import _ from "lodash";
import getPromotionCombinations from "./getPromotionCombinations.js";
import getHighestCombination from "./getHighestCombination.js";


/**
 * @summary get all applicable promotions
 * @param {*} context - The application context
 * @param {*} cart - The cart to apply the promotion to
 * @param {*} promotions - The promotions to apply
 * @returns {Promise<Array<Object>>} - An array of promotions
*/
export default async function getApplicablePromotions(context, cart, promotions) {
  const promotionsWithoutShippingDiscount = _.filter(promotions, (promotion) => promotion.promotionType !== "shipping-discount");
  const shippingPromotions = _.differenceBy(promotions, promotionsWithoutShippingDiscount, "_id");

  const discountCalculationMethodOrder = ["flat", "percentage", "fixed", "none"];
  const sortedPromotions = _.sortBy(promotionsWithoutShippingDiscount, (promotion) => {
    const method = promotion.actions[0]?.actionParameters?.discountCalculationMethod || "none";
    return discountCalculationMethodOrder.indexOf(method);
  });

  const promotionCombinations = await getPromotionCombinations(context, cart, sortedPromotions);
  const highestPromotions = await getHighestCombination(context, cart, promotionCombinations);
  const applicablePromotions = highestPromotions.concat(shippingPromotions);

  return applicablePromotions;
}
