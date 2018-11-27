import { xformPricingArray } from "@reactioncommerce/reaction-graphql-xforms/product";

export default function pricing(catalogProduct) {
  return xformPricingArray(catalogProduct.pricing);
}
