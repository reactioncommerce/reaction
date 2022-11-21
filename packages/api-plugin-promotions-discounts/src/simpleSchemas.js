import SimpleSchema from "simpl-schema";

export const Rules = new SimpleSchema({
  conditions: {
    type: Object,
    blackbox: true
  }
});

/**
 * @name Discounts
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Discounts schema
 */
export const Discount = new SimpleSchema({
  _id: {
    type: String,
    optional: true
  },
  shopId: {
    type: String,
    label: "Discounts shopId"
  },
  label: {
    type: String
  },
  description: {
    type: String
  },
  discountType: {
    type: String,
    allowedValues: ["item", "order", "shipping"]
  },
  discountCalculationType: {
    type: String,
    allowedValues: ["flat", "fixed", "percentage"] // this can be extended via plugin
  },
  discountValue: {
    type: Number
  },
  inclusionRules: {
    type: Rules
  },
  exclusionRules: {
    type: Rules,
    optional: true
  }
});

export const CartDiscountedItem = new SimpleSchema({
  _id: String,
  amount: Number
});

export const CartDiscount = new SimpleSchema({
  "promotionId": String,
  "discountType": String,
  "discountCalculationType": String, // types provided by this plugin are flat, percentage and fixed
  "discountValue": Number,
  "discountMaxValue": {
    type: Number,
    optional: true
  },
  "discountMaxUnits": {
    type: Number,
    optional: true
  },
  "dateApplied": {
    type: Date
  },
  "dateExpires": {
    type: Date,
    optional: true
  },
  "discountedItemType": {
    type: String,
    allowedValues: ["order", "item", "shipping"],
    optional: true
  },
  "discountedAmount": {
    type: Number,
    optional: true
  },
  "discountedItems": {
    type: Array,
    optional: true
  },
  "discountedItems.$": {
    type: CartDiscountedItem
  }
});
