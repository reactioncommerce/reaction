import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { shopIdAutoValue } from "/lib/collections/schemas/helpers";

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
  postal: {
    type: String,
    optional: true
  },
  rate: {
    type: Number,
    decimal: true
  }
});

export const Taxes = new SimpleSchema({
  shopId: {
    type: String,
    autoValue: shopIdAutoValue,
    index: 1,
    label: "Taxes shopId"
  },
  taxCode: {
    type: String,
    label: "Tax Identifier"
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
  region: {
    label: "State/Province/Region",
    type: String,
    optional: true
  },
  postal: {
    label: "ZIP/Postal Code",
    type: String,
    optional: true
  },
  country: {
    type: String,
    label: "Country",
    optional: true
  },
  isCommercial: {
    label: "Commercial address.",
    type: Boolean,
    optional: true
  },
  rate: {
    type: Number,
    decimal: true
  }
});
