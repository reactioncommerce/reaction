import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { shopIdAutoValue } from "./helpers";

/**
* TaxRates Schema
*/

export const TaxRates = new SimpleSchema({
  country: {
    type: String
  },
  county: {
    type: String,
    optional: true
  },
  rate: {
    type: Number
  }
});

export const Taxes = new SimpleSchema({
  shopId: {
    type: String,
    autoValue: shopIdAutoValue,
    index: 1,
    label: "Taxes shopId"
  },
  cartMethod: {
    label: "Calculation Method",
    type: String,
    allowedValues: ["unit", "row", "total"]
  },
  taxLocale: {
    label: "Taxation Location",
    type: String,
    allowedValues: ["shipping", "billing", "origination", "destination"]
  },
  taxShipping: {
    label: "Tax Shipping",
    type: Boolean,
    defaultValue: false
  },
  taxIncluded: {
    label: "Taxes included in product prices",
    type: Boolean,
    defaultValue: false
  },
  discountsIncluded: {
    label: "Tax before discounts",
    type: Boolean,
    defaultValue: false
  },
  rates: {
    label: "Tax Rate",
    type: [TaxRates]
  }
});
