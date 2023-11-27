import SimpleSchema from "simpl-schema";

const allowOperators = [
  "equal",
  "notEqual",
  "lessThan",
  "lessThanInclusive",
  "greaterThan",
  "greaterThanInclusive",
  "in",
  "notIn",
  "contains",
  "doesNotContain"
];

export const ConditionRule = new SimpleSchema({
  "fact": {
    type: String,
    allowedValues: ["cart", "item", "shipping"]
  },
  "operator": {
    type: String,
    allowedValues: allowOperators
  },
  "path": {
    type: String,
    optional: true
  },
  "value": {
    type: SimpleSchema.oneOf(String, Number, Boolean, Array)
  },
  "value.$": {
    type: SimpleSchema.oneOf(String, Number, Boolean)
  },
  "params": {
    type: Object,
    blackbox: true,
    optional: true
  }
});

export const RuleExpression = new SimpleSchema({
  "all": {
    type: Array,
    optional: true
  },
  "all.$": {
    type: ConditionRule
  },
  "any": {
    type: Array,
    optional: true
  },
  "any.$": {
    type: ConditionRule
  }
});

export const DiscountActionCondition = new SimpleSchema({
  conditions: {
    type: RuleExpression
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
    type: DiscountActionCondition
  },
  exclusionRules: {
    type: DiscountActionCondition,
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
  },
  "neverStackWithOtherItemLevelDiscounts": {
    type: Boolean,
    defaultValue: true
  },
  "neverStackWithOtherShippingDiscounts": {
    type: Boolean,
    defaultValue: true
  }
});
