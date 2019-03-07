import SimpleSchema from "simpl-schema";

export const Taxes = new SimpleSchema({
  _id: String,
  /**
   * Custom key/value data that you need to store.
   * You'll need to extend GraphQL schemas if you
   * want to expose any of this data through the API.
   */
  customFields: {
    type: Object,
    blackbox: true,
    optional: true
  },
  jurisdictionId: {
    type: String,
    optional: true
  },
  sourcing: {
    type: String,
    allowedValues: ["destination", "origin"]
  },
  tax: {
    type: Number,
    min: 0
  },
  taxableAmount: {
    type: Number,
    min: 0
  },
  taxName: String,
  taxRate: {
    type: Number,
    min: 0
  }
});

export const TaxSummary = new SimpleSchema({
  calculatedAt: Date,
  calculatedByTaxServiceName: {
    type: String,
    optional: true
  },
  /**
   * Custom key/value data that you need to store.
   * You'll need to extend GraphQL schemas if you
   * want to expose any of this data through the API.
   */
  customFields: {
    type: Object,
    blackbox: true,
    optional: true
  },
  referenceId: {
    type: String,
    optional: true
  },
  tax: {
    type: Number,
    min: 0
  },
  taxableAmount: {
    type: Number,
    min: 0
  },
  taxes: [Taxes]
});

export const TaxServiceItemTax = new SimpleSchema({
  /**
   * Custom key/value data that you need to store.
   * You'll need to extend GraphQL schemas if you
   * want to expose any of this data through the API.
   */
  customFields: {
    type: Object,
    blackbox: true,
    optional: true
  },
  itemId: String,
  tax: {
    type: Number,
    min: 0
  },
  taxableAmount: {
    type: Number,
    min: 0
  },
  taxes: [Taxes]
});

export const TaxServiceResult = new SimpleSchema({
  itemTaxes: [TaxServiceItemTax],
  taxSummary: TaxSummary
});
