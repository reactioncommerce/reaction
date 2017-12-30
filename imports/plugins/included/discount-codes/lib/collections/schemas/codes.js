import SimpleSchema from "simpl-schema";
import { Discounts } from "/imports/plugins/core/discounts/lib/collections/schemas";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
* Discount Codes Schema
* @type {Object}
* @desc schema that extends discount schema
* with properties for discount codes.
*/
export const DiscountCodes = Discounts.clone().extend({
  "discountMethod": {
    label: "Method",
    type: String,
    defaultValue: "code"
  },
  "calculation.method": {
    type: String,
    index: 1,
    defaultValue: "discount"
  },
  "code": {
    label: "Discount Code",
    type: String
  },
  "conditions.redemptionLimit": {
    type: SimpleSchema.Integer,
    label: "Total Limit",
    optional: true
  },
  "conditions.accountLimit": {
    type: SimpleSchema.Integer,
    label: "Account Limit",
    defaultValue: 1,
    optional: true
  }
});

registerSchema("DiscountCodes", DiscountCodes);
