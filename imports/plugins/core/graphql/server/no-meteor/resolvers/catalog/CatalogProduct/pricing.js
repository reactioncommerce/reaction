import { xformPricingArray, xformCurrencyExchangePricing } from "@reactioncommerce/reaction-graphql-xforms/product";

export default function pricing(catalogProduct, currencyCode = "", context) {
  let pricing = xformPricingArray(catalogProduct.pricing);

  if (currencyCode) {
    pricing = xformCurrencyExchangePricing(pricing, currencyCode, context);
  }

  return pricing;
}
