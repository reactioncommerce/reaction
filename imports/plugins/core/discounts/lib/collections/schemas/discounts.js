import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { shopIdAutoValue } from "/lib/collections/schemas/helpers";
import { registerSchema } from "@reactioncommerce/reaction-collections";

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
}, { check, tracker: Tracker });

registerSchema("Transactions", Transactions);

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
    type: Array,
    optional: true
  },
  "transactions.$": {
    type: Transactions
  },
  "calculation": {
    type: Object,
    optional: true,
    label: "Calculation",
    defaultValue: {}
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
    label: "Conditions",
    defaultValue: {}
  },
  "conditions.order": {
    type: Object,
    defaultValue: {}
  },
  "conditions.order.min": {
    type: Number,
    label: "Mininum",
    defaultValue: 0.00
  },
  "conditions.order.max": {
    type: Number,
    label: "Maximum",
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
    type: Array,
    optional: true,
    label: "Audience"
  },
  "conditions.audience.$": {
    type: String,
    optional: true,
    label: "Audience"
  },
  "conditions.permissions": {
    type: Array,
    optional: true,
    label: "Permissions"
  },
  "conditions.permissions.$": {
    type: String,
    optional: true,
    label: "Permission"
  },
  "conditions.products": {
    type: Array,
    optional: true,
    label: "Products"
  },
  "conditions.products.$": {
    type: String,
    optional: true,
    label: "Product"
  },
  "conditions.tags": {
    type: Array,
    optional: true,
    label: "Tags"
  },
  "conditions.tags.$": {
    type: String,
    optional: true,
    label: "Tag"
  }
}, { check, tracker: Tracker });

registerSchema("Discounts", Discounts);
