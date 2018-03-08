import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { registerSchema } from "@reactioncommerce/reaction-collections";
import { createdAtAutoValue, schemaIdAutoValue } from "./helpers";
import { Address } from "./address";
import { Workflow } from "./workflow";

/**
 * @name PaymentItem
 * @summary Schema for items we're inserting into our Payments
 * To keep track of what items were paid for with a given paymentMethod
 * @type {SimpleSchema}
 * @memberof schemas
 * @property {String} _id optional, Shipment Line Item
 * @property {String} productId required
 * @property {String} shopId optional, Shipment Item ShopId
 * @property {Number} quantity required
 * @property {String} variantId required
 */
export const PaymentItem = new SimpleSchema({
  _id: {
    type: String,
    label: "Shipment Line Item",
    optional: true,
    autoValue: schemaIdAutoValue
  },
  productId: {
    type: String,
    index: 1
  },
  shopId: {
    type: String,
    index: 1,
    label: "Shipment Item ShopId",
    optional: true
  },
  quantity: {
    label: "Quantity",
    type: SimpleSchema.Integer,
    min: 0
  },
  variantId: {
    type: String
  }
}, { check, tracker: Tracker });

registerSchema("PaymentItem", PaymentItem);

/**
 * @name PaymentMethod
 * @type {SimpleSchema}
 * @memberof schemas
 * @property {String} processor required
 * @property {String} paymentPackageId required
 * @property {String} paymentSettingsKey required
 * @property {String} storedCard optional
 * @property {String} method, allowed values: `"credit"`, `"debit"`, `"shipping-credit"`
 * @property {String} transactionId required
 * @property {Object} metadata optional, blackbox
 * @property {Workflow} workflow optional
 * @property {String} status required
 * @property {String} mode, allowed values: `"authorize"`, `"capture"`, `"refund"`, `"cancel"`, `"void"`
 * @property {String} riskLevel, allowed values: `"normal"`, `"elevated"`, `"high"`
 * @property {Date} createdAt required
 * @property {Date} updatedAt optional
 * @property {String} authorization optional
 * @property {Number} amount optional
 * @property {String} currency required
 * @property {Object[]} transactions optional, blackbox
 * @property {PaymentItem[]} items optional
 * @property {String} shopId optional
 */
export const PaymentMethod = new SimpleSchema({
  "processor": {
    type: String
  },
  "paymentPackageId": {
    type: String
  },
  "paymentSettingsKey": {
    type: String
  },
  "storedCard": {
    type: String,
    optional: true
  },
  "method": {
    type: String,
    allowedValues: ["credit", "debit", "shipping-credit"],
    optional: true
  },
  "transactionId": {
    type: String
  },
  "metadata": {
    type: Object,
    optional: true,
    blackbox: true
  },
  "workflow": {
    type: Workflow,
    optional: true,
    defaultValue: {}
  },
  "status": {
    type: String
  },
  "mode": {
    type: String,
    allowedValues: ["authorize", "capture", "refund", "cancel", "void"]
  },
  "riskLevel": {
    type: String,
    allowedValues: ["normal", "elevated", "high"],
    optional: true
  },
  "createdAt": {
    type: Date,
    autoValue: createdAtAutoValue
  },
  "updatedAt": {
    type: Date,
    optional: true
  },
  "authorization": {
    type: String,
    optional: true
  },
  "amount": {
    type: Number,
    optional: true
  },
  "currency": {
    type: String,
    optional: true
  },
  "transactions": {
    type: Array,
    optional: true
  },
  "transactions.$": {
    type: Object,
    blackbox: true
  },
  "items": {
    type: Array,
    optional: true
  },
  "items.$": {
    type: PaymentItem
  },
  "shopId": {
    type: String,
    optional: true
  }
}, { check, tracker: Tracker });

registerSchema("PaymentMethod", PaymentMethod);

// When checking paymentMethod passed as a method arg, props like createdAt
// should be optional
export const PaymentMethodArgument = PaymentMethod.clone().extend({
  createdAt: {
    type: Date,
    optional: true,
    autoValue: null
  }
});

/**
 * @name Invoice
 * @type {SimpleSchema}
 * @memberof schemas
 * @property {String} transaction optional
 * @property {Number} shipping optional
 * @property {Number} taxes optional
 * @property {Number} subtotal required
 * @property {Number} discounts optional
 * @property {Number} total required
 */
export const Invoice = new SimpleSchema({
  transaction: {
    type: String,
    optional: true
  },
  shipping: {
    type: Number,
    optional: true
  },
  taxes: {
    type: Number,
    optional: true
  },
  subtotal: {
    type: Number
  },
  discounts: {
    type: Number,
    optional: true
  },
  total: {
    type: Number
  }
}, { check, tracker: Tracker });

registerSchema("Invoice", Invoice);

/**
 * @name CurrencyExchangeRate
 * @type {SimpleSchema}
 * @memberof schemas
 * @property {String} userCurrency, default value: `"USD"`
 * @property {Number} exchangeRate optional
 */
export const CurrencyExchangeRate = new SimpleSchema({
  userCurrency: {
    type: String,
    optional: true,
    defaultValue: "USD"
  },
  exchangeRate: {
    type: Number,
    optional: true
  }
}, { check, tracker: Tracker });

registerSchema("CurrencyExchangeRate", CurrencyExchangeRate);

/**
 * @name Payment
 * @type {SimpleSchema}
 * @memberof schemas
 * @property {String} _id required, Payment Id
 * @property {Address} address optional
 * @property {PaymentMethod} paymentMethod optional
 * @property {Invoice} invoice optional
 * @property {CurrencyExchangeRate} currency optional
 * @property {String} shopId optional
 */
export const Payment = new SimpleSchema({
  _id: {
    type: String,
    label: "Payment Id",
    autoValue: schemaIdAutoValue
  },
  address: {
    type: Address,
    optional: true
  },
  paymentMethod: {
    type: PaymentMethod,
    optional: true,
    blackbox: true
  },
  invoice: {
    type: Invoice,
    optional: true
  },
  currency: {
    type: CurrencyExchangeRate,
    optional: true,
    defaultValue: {}
  },
  shopId: {
    type: String,
    optional: true
  }
}, { check, tracker: Tracker });

registerSchema("Payment", Payment);

/**
 * @name Payment
 * @type {SimpleSchema}
 * @memberof schemas
 * @property {String} type required
 * @property {Number} amount required
 * @property {Number} created required
 * @property {String} currency required
 * @property {Object} raw optional, blackbox
 */
export const Refund = new SimpleSchema({
  type: {
    type: String
  },
  amount: {
    type: Number
  },
  created: {
    type: SimpleSchema.Integer
  },
  currency: {
    type: String
  },
  raw: {
    type: Object,
    optional: true,
    blackbox: true
  }
}, { check, tracker: Tracker });

registerSchema("Refund", Refund);
