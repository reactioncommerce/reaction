import evaluateRulesAgainstShipping from "./evaluateRulesAgainstShipping.js";

/**
 * @summary Add the discount to rates
 * @param {Object} context - The application context
 * @param {Object} commonOrder - The order to apply the discount to
 * @param {Object} rates - The rates to apply the discount to
 * @returns {Promise<void>} undefined
 */
export default async function applyDiscountsToRates(context, commonOrder, rates) {
  const shipping = {
    discounts: commonOrder.discounts || [],
    shipmentQuotes: rates
  };
  const discountedShipping = await evaluateRulesAgainstShipping(context, shipping);

  /* eslint-disable-next-line no-param-reassign */
  rates = discountedShipping.shipmentQuotes;
}
