import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { schemaIdAutoValue } from "./helpers";
import { Address } from "./address";
import { Workflow } from "./workflow";

/**
 * PaymentMethod Schema
 */

export const PaymentMethod = new SimpleSchema({
  processor: {
    type: String
  },
  storedCard: {
    type: String,
    optional: true
  },
  method: {
    type: String,
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
    allowedValues: ["authorize", "capture", "refund", "void"]
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
    },
    denyUpdate: true
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
  }
});

/**
 * Invoice Schema
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

/**
 * Payment Schema
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
    optional: true
  },
  invoice: {
    type: Invoice,
    optional: true
  }
});

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
