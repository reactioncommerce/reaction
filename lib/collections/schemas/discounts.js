import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { shopIdAutoValue } from "./helpers";

/**
* DiscountType Schema
*/

export const DiscountType = new SimpleSchema({
  percentage: {
    type: Number,
    optional: true,
    label: "Percentage"
  },
  fixed: {
    type: Number,
    optional: true,
    label: "Price Discount"
  },
  shipping: {
    type: Boolean,
    label: "Free Shipping",
    optional: true
  }
});

/**
* DiscountRules Schema
*/

export const DiscountRules = new SimpleSchema({
  "validUses": {
    type: Number,
    optional: true
  },
  "products": {
    type: [String],
    optional: true
  },
  "codes": {
    type: [String],
    optional: true
  },
  "range": {
    type: [Object],
    optional: true
  },
  "range.$.begin": {
    type: Number,
    optional: true
  },
  "range.$.end": {
    type: Number,
    optional: true
  }
});

/**
* Discounts Schema
*/

export const Discounts = new SimpleSchema({
  shopId: {
    type: String,
    autoValue: shopIdAutoValue,
    index: 1
  },
  beginDate: {
    type: Date,
    optional: true
  },
  endDate: {
    type: Date,
    optional: true
  },
  discount: {
    type: DiscountType
  },
  rules: {
    type: DiscountRules
  }
});
