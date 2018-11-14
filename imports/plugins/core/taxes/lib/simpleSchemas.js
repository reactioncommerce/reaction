import SimpleSchema from "simpl-schema";

export const Taxes = new SimpleSchema({
  _id: String,
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

export const TaxServiceResult = new SimpleSchema({
  "itemTaxes": Array,
  "itemTaxes.$": Object,
  "itemTaxes.$.itemId": String,
  "itemTaxes.$.tax": {
    type: Number,
    min: 0
  },
  "itemTaxes.$.taxableAmount": {
    type: Number,
    min: 0
  },
  "itemTaxes.$.taxes": [Taxes],
  "taxSummary": TaxSummary
});
