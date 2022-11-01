export const promotionOfferFacts = {};

/**
 * @summary register the promotion offer facts
 * @param {Array} params.promotionOfferFacts - The array of promotion offer facts to register
 * @return {void} undefined
 */
export function registerPromotionOfferFacts({ promotionOfferFacts: facts }) {
  if (facts) {
    Object.assign(promotionOfferFacts, facts);
  }
}
