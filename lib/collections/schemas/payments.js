import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { schemaIdAutoValue } from "./helpers";
import { Address } from "./address";
import { Workflow } from "./workflow";
import { registerSchema } from "@reactioncommerce/reaction-collections";

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
    type: Number,
    min: 0
  },
  variantId: {
    type: String
  }
});

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
  processor: {
    type: String
  },
  paymentPackageId: {
    type: String
  },
  paymentSettingsKey: {
    type: String
  },
  storedCard: {
    type: String,
    optional: true
  },
  method: {
    type: String,
    allowedValues: ["credit", "debit", "shipping-credit"],
    optional: true
  },
  transactionId: {
    type: String
  },
  metadata: {
    type: Object,
    optional: true,
    blackbox: true
  },
  workflow: {
    type: Workflow,
    optional: true
  },
  status: {
    type: String
  },
  mode: {
    type: String,
    allowedValues: ["authorize", "capture", "refund", "cancel", "void"]
  },
  riskLevel: {
    type: String,
    allowedValues: ["normal", "elevated", "high"],
    optional: true
  },
  createdAt: {
    type: Date,
    autoValue: function () {
      if (this.isInsert) {
        return new Date;
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      }
    }
  },
  updatedAt: {
    type: Date,
    optional: true
  },
  authorization: {
    type: String,
    optional: true
  },
  amount: {
    type: Number,
    decimal: true,
    optional: true
  },
  currency: {
    type: String,
    optional: true
  },
  transactions: {
    type: [Object],
    optional: true,
    blackbox: true
  },
  items: {
    type: [PaymentItem],
    optional: true
  },
  shopId: {
    type: String,
    optional: true
  }
});

registerSchema("PaymentMethod", PaymentMethod);

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
    decimal: true,
    optional: true
  },
  taxes: {
    type: Number,
    decimal: true,
    optional: true
  },
  subtotal: {
    type: Number,
    decimal: true
  },
  discounts: {
    type: Number,
    decimal: true,
    optional: true
  },
  total: {
    type: Number,
    decimal: true
  }
});

registerSchema("Invoice", Invoice);

/**
 * @name Currency
 * @type {SimpleSchema}
 * @memberof schemas
 * @property {String} userCurrency, default value: `"USD"`
 * @property {Number} exchangeRate optional
 */
export const Currency = new SimpleSchema({
  userCurrency: {
    type: String,
    optional: true,
    defaultValue: "USD"
  },
  exchangeRate: {
    type: Number,
    decimal: true,
    optional: true
  }
});

registerSchema("Currency", Currency);

/**
 * @name Payment
 * @type {SimpleSchema}
 * @memberof schemas
 * @property {String} _id required, Payment Id
 * @property {Address} address optional
 * @property {PaymentMethod} paymentMethod optional
 * @property {Invoice} invoice optional
 * @property {Currency} currency optional
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
    type: Currency,
    optional: true
  },
  shopId: {
    type: String,
    optional: true
  }
});

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
    type: Number,
    decimal: true
  },
  created: {
    type: Number
  },
  currency: {
    type: String
  },
  raw: {
    type: Object,
    optional: true,
    blackbox: true
  }
});

registerSchema("Refund", Refund);
