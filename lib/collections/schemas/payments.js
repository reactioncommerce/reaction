import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { schemaIdAutoValue } from "./helpers";
import { Address } from "./address";
import { Workflow } from "./workflow";


/**
 * Schema for items we're inserting into our Payments to keep track of what items
 * were paid for with a given paymentMethod
 * @type {SimpleSchema}
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


/**
 * PaymentMethod Schema
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
 * Currency Schema
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
