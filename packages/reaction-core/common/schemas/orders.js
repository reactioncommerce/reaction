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
  workflow: {
    type: ReactionCore.Schemas.Workflow,
    optional: true
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
    decimal: true
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
  address: {
    type: ReactionCore.Schemas.Address,
    optional: true
  },
  paymentMethod: {
    type: [ReactionCore.Schemas.PaymentMethod],
    optional: true
  },
  invoices: {
    type: [ReactionCore.Schemas.Invoice],
    optional: true
  }
});

/**
 * Order Document Schema
 */

ReactionCore.Schemas.Document = new SimpleSchema({
  docId: {
    type: String
  },
  docType: {
    type: String,
    optional: true
  }
});

/**
 * Order History Schema
 */

ReactionCore.Schemas.History = new SimpleSchema({
  event: {
    type: String
  },
  userId: {
    type: String
  },
  updatedAt: {
    type: Date
  }
});

/**
 * Order Notes Schema
 */

ReactionCore.Schemas.Notes = new SimpleSchema({
  content: {
    type: String
  },
  userId: {
    type: String
  },
  updatedAt: {
    type: Date
  }
});

/**
 * OrderItems Schema
 * merges with ReactionCore.Schemas.Cart, ReactionCore.Schemas.Order]
 * to create Orders collection
 */

ReactionCore.Schemas.OrderItems = new SimpleSchema({
  additionalField: {
    type: String,
    optional: true
  },
  workflow: {
    type: ReactionCore.Schemas.Workflow,
    optional: true
  },
  history: {
    type: [ReactionCore.Schemas.History],
    optional: true
  },
  documents: {
    type: [ReactionCore.Schemas.Document],
    optional: true
  }
});

/**
 * Order Schema
 * extended from cart schema
 */

ReactionCore.Schemas.Order = new SimpleSchema({
  cartId: {
    type: String,
    optional: true
  },
  history: {
    type: [ReactionCore.Schemas.History],
    optional: true
  },
  documents: {
    type: [ReactionCore.Schemas.Document],
    optional: true
  },
  notes: {
    type: [ReactionCore.Schemas.Notes],
    optional: true
  }
});
