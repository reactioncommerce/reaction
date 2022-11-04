import { Engine } from "json-rules-engine";

/**
 * @summary Check if a shipment quote matches a discount rule
 * @param {Object} context - The application context
 * @param {Object} shipmentQuote - The shipment quote to evaluate rules against
 * @param {Object} discount - The discount to evaluate rules against
 * @returns {Boolean} True if the rules pass, false otherwise
 */
async function doesDiscountApply(context, shipmentQuote, discount) {
  const { promotions: { operators } } = context;
  const engine = new Engine();
  engine.addRule(discount.inclusionRules);
  Object.keys(operators).forEach((operatorKey) => {
    engine.addOperator(operatorKey, operators[operatorKey]);
  });
  const results = await engine.run(shipmentQuote);
  if (results.events.length) return true;
  return false;
}

/**
 * @summary Apply a discount to a shipment quote
 * @param {Object} context - The application context
 * @param {Object} shipmentQuote - The shipment quote to apply the discount to
 * @param {Object} discounts - The discounts to apply
 * @returns {void} undefined
 */
function applyDiscounts(context, shipmentQuote, discounts) {
  let totalDiscount = 0;
  const amountBeforeDiscounts = shipmentQuote.method.undiscountedRate;
  discounts.forEach((discount) => {
    const calculationMethod = context.discountCalculationMethods[discount.discountCalculationType];
    const discountAmount = calculationMethod(discount.discountValue, amountBeforeDiscounts);
    totalDiscount += discountAmount;
  });
  shipmentQuote.rate = shipmentQuote.method.undiscountedRate - totalDiscount;
  shipmentQuote.method.rate = shipmentQuote.method.undiscountedRate - totalDiscount;
}

/**
 * @summary check every discount on a shipping method and apply it to quotes
 * @param {Object} context - The application context
 * @param {Object} shipping - The shipping record to evaluate
 * @returns {Promise<Object>} the possibly mutated shipping object
 */
export default async function evaluateRulesAgainstShipping(context, shipping) {
  for (const shipmentQuote of shipping.shipmentQuotes) {
    if (!shipmentQuote.method.undiscountedRate) {
      shipmentQuote.method.undiscountedRate = shipmentQuote.method.rate;
    }
  }

  for (const shipmentQuote of shipping.shipmentQuotes) {
    const applicableDiscounts = [];
    for (const discount of shipping.discounts) {
      // eslint-disable-next-line no-await-in-loop
      const discountApplies = await doesDiscountApply(context, shipmentQuote, discount);
      if (discountApplies) {
        applicableDiscounts.push(discount);
      }
    }
    if (applicableDiscounts.length) {
      applyDiscounts(context, shipmentQuote, applicableDiscounts);
    }
  }
  return shipping;
}
