import { Discounts } from "/imports/plugins/core/discounts/lib/collections/schemas/discounts";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
* Discount Codes Schema
* @type {Object}
* @desc schema that extends discount schema
* with properties for discount codes.
*/
export const DiscountRates = Discounts.clone().extend({
  discountMethod: {
    label: "Calculation Method",
    type: String,
    defaultValue: "rate"
  }
});

registerSchema("DiscountRates", DiscountRates);
