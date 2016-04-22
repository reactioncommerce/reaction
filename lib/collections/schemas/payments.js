/**
 * PaymentMethod Schema
 */

ReactionCore.Schemas.PaymentMethod = new SimpleSchema({
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
    type: ReactionCore.Schemas.Workflow,
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

ReactionCore.Schemas.Invoice = new SimpleSchema({
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

ReactionCore.Schemas.Payment = new SimpleSchema({
  _id: {
    type: String,
    label: "Payment Id",
    autoValue: ReactionCore.schemaIdAutoValue
  },
  address: {
    type: ReactionCore.Schemas.Address,
    optional: true
  },
  paymentMethod: {
    type: ReactionCore.Schemas.PaymentMethod,
    optional: true
  },
  invoice: {
    type: ReactionCore.Schemas.Invoice,
    optional: true
  }
});

ReactionCore.Schemas.Refund = new SimpleSchema({
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
