import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { shopIdAutoValue } from "/lib/collections/schemas/helpers";

// The Discounts Schema validates using multiple schemas
// be sure to use `{ selector: { discountMethod: "code" } }`
// to indicate which schema to apply in all updates

/*
* Discounts Tranaction History Schema
*/
export const Transactions = new SimpleSchema({
  cartId: {
    type: String,
    index: 1
  },
  userId: {
    type: String,
    index: 1
  },
  appliedAt: {
    type: Date,
    optional: true
  }
});

/*
* Discounts Schema
*/

export const Discounts = new SimpleSchema({
  "shopId": {
    type: String,
    autoValue: shopIdAutoValue,
    index: 1,
    label: "Discounts shopId"
  },
  "label": {
    type: String,
    optional: true
  },
  "description": {
    type: String,
    optional: true
  },
  "discountMethod": {
    label: "Discount Method Type",
    type: String,
    index: 1,
    allowedValues: ["code", "rate"]
  },
  // discount is allowed to be string or number.
  // it's a formula value (could be shipping code)
  "discount": {
    type: String,
    optional: true
  },
  "transactions": {
    type: [Transactions],
    optional: true
  },
  "calculation": {
    type: Object,
    optional: true,
    label: "Calculation"
  },
  "calculation.method": {
    type: String,
    index: 1,
    defaultValue: "discount",
    allowedValues: ["credit", "discount", "sale", "shipping"]
  },
  "conditions": {
    type: Object,
    optional: true,
    label: "Conditions"
  },
  "conditions.order": {
    type: Object
  },
  "conditions.order.min": {
    type: Number,
    label: "Mininum",
    decimal: true,
    defaultValue: 0.00
  },
  "conditions.order.max": {
    type: Number,
    label: "Maximum",
    decimal: true,
    optional: true
  },
  "conditions.order.startDate": {
    type: Date,
    label: "Start",
    optional: true
  },
  "conditions.order.endDate": {
    type: Date,
    label: "End",
    optional: true
  },
  "conditions.enabled": {
    type: Boolean,
    label: "Enabled",
    defaultValue: true,
    optional: true
  },
  "conditions.audience": {
    type: [String],
    optional: true,
    label: "Audience"
  },
  "conditions.permissions": {
    type: [String],
    optional: true,
    label: "Permissions"
  },
  "conditions.products": {
    type: [String],
    optional: true,
    label: "Products"
  },
  "conditions.tags": {
    type: [String],
    optional: true,
    label: "Tags"
  }
});
