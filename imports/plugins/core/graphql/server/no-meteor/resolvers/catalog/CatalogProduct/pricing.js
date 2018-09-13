import { xformPricingArray } from "@reactioncommerce/reaction-graphql-xforms/product";

export default function pricing(catalogProduct, currencyCode = "", context) {
  return xformPricingArray(catalogProduct.pricing);
}
