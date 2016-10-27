import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { shopIdAutoValue } from "/lib/collections/schemas/helpers";

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
    type: String
  },
  "description": {
    type: String,
    optional: true
  },
  "discountMethod": {
    label: "Calculation Method",
    type: String,
    allowedValues: ["value", "percent", "shipping"],
    defaultValue: "total"
  },
  "discount": {
    type: String,
    optional: true
  },
  "conditions": {
    type: Array,
    optional: true,
    label: "Conditions"
  },
  "conditions.$": {
    type: Object
  },
  "conditions.$.order": {
    type: Object
  },
  "conditions.$.order.min": {
    type: Number,
    label: "Mininum",
    decimal: true,
    defaultValue: 0.00
  },
  "conditions.$.order.max": {
    type: Number,
    label: "Maximum",
    decimal: true,
    optional: true
  },
  "conditions.$.order.startDate": {
    type: Date,
    label: "Start",
    optional: true
  },
  "conditions.$.order.endDate": {
    type: Date,
    label: "End",
    optional: true
  },
  "conditions.$.enabled": {
    type: Boolean,
    label: "Enabled",
    defaultValue: true,
    optional: true
  },
  "conditions.$.redemptionLimit": {
    type: Number,
    label: "Plugin",
    defaultValue: "Custom",
    optional: true
  },
  "conditions.$.accountLimit": {
    type: Number,
    label: "Enabled",
    defaultValue: 1,
    optional: true
  },
  "conditions.$.audience": {
    type: [String],
    optional: true,
    label: "Audience"
  },
  "conditions.$.permissions": {
    type: [String],
    optional: true,
    label: "Audience"
  },
  "conditions.$.products": {
    type: [String],
    optional: true,
    label: "Products"
  },
  "conditions.$.tags": {
    type: [String],
    optional: true,
    label: "Tags"
  }
});
