import evaluateRulesAgainstShipping from "./evaluateRulesAgainstShipping.js";

export default async function applyDiscountsToRates(context, commonOrder, rates) {
  const shipping = {
    discounts: commonOrder.discounts || [],
    shipmentQuotes: rates
  };
  const discountedShipping = await evaluateRulesAgainstShipping(context, shipping);
  rates = discountedShipping.shipmentQuotes;
}
