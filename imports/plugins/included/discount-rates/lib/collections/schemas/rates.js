import { Discounts } from "/imports/plugins/core/discounts/lib/collections/schemas/discounts";
import { registerSchema } from "@reactioncommerce/schemas";

/**
 * @name DiscountRates
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary A schema that extends discounts schema with properties for discount rates.
 */
export const DiscountRates = Discounts.clone().extend({
  discountMethod: {
    label: "Calculation Method",
    type: String,
    defaultValue: "rate"
  }
});

registerSchema("DiscountRates", DiscountRates);
