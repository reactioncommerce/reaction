import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Schemas } from "@reactioncommerce/reaction-collections";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
* Discount Codes Schema
* @type {Object}
* @desc schema that extends discount schema
* with properties for discount codes.
*/
export const DiscountCodes = new SimpleSchema([
  Schemas.Discounts, {
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
      type: Number,
      label: "Total Limit",
      optional: true
    },
    "conditions.accountLimit": {
      type: Number,
      label: "Account Limit",
      defaultValue: 1,
      optional: true
    }
  }
]);

registerSchema("DiscountCodes", DiscountCodes);
