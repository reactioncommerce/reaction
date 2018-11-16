import SimpleSchema from "simpl-schema";
import { Address, ShippingParcel } from "/imports/collections/schemas";

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

const Money = new SimpleSchema({
  currencyCode: String,
  amount: {
    type: Number,
    min: 0
  }
});

const TaxServiceOrderInputItem = new SimpleSchema({
  _id: String,
  isTaxable: {
    type: Boolean,
    optional: true
  },
  parcel: {
    type: ShippingParcel,
    optional: true
  },
  price: Money,
  quantity: {
    type: SimpleSchema.Integer,
    min: 0
  },
  shopId: String,
  subtotal: Money,
  taxCode: {
    type: String,
    optional: true
  },
  variantId: String
});

const TaxServiceOrderInputFulfillmentPrices = new SimpleSchema({
  handling: Money,
  shipping: Money,
  total: Money
});

export const TaxServiceOrderInput = new SimpleSchema({
  currencyCode: String,
  fulfillmentPrices: TaxServiceOrderInputFulfillmentPrices,
  fulfillmentType: {
    type: String,
    allowedValues: ["shipping"]
  },
  items: [TaxServiceOrderInputItem],
  originAddress: {
    type: Address,
    optional: true
  },
  shippingAddress: {
    type: Address,
    optional: true
  },
  shopId: String
});
