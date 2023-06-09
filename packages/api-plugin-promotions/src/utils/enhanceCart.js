import _ from "lodash";

/**
 * @summary enhance the cart with calculated totals
 * @param {Object} context - The application context
 * @param {Array<Function>} enhancers - The enhancers to apply
 * @param {Object} cart - The cart to enhance
 * @returns {Object} - The enhanced cart
 */
export default function enhanceCart(context, enhancers, cart) {
  const cartForEvaluation = _.cloneDeep(cart);
  enhancers.forEach((enhancer) => {
    enhancer(context, cartForEvaluation);
  });
  return cartForEvaluation;
}
