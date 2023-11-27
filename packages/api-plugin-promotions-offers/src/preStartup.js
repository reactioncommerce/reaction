import { ConditionRule } from "./simpleSchemas.js";

/**
 * @summary Pre-startup function for api-plugin-promotions-offer
 * @param {Object} context - Startup context
 * @returns {Promise<void>} undefined
 */
export default async function preStartupPromotionOffer(context) {
  const { promotionOfferFacts, promotions: { allowOperators } } = context;

  const promotionFactKeys = Object.keys(promotionOfferFacts);

  ConditionRule.extend({
    fact: {
      allowedValues: ConditionRule.getAllowedValuesForKey("fact").concat(promotionFactKeys)
    },
    operator: {
      allowedValues: allowOperators
    }
  });
}
