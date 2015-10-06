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
 * @see common/collections.collection.js
 */
ReactionCore.Schemas.OrderItem = new SimpleSchema({
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
 * @see common/collections.collection.js
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
  },
  items: {
    type: [ReactionCore.Schemas.OrderItem],
    optional: true
  },
  // order transactions tie shipping, billing, and inventory transactions
  transactions: {
    type: [Object],
    optional: true,
    blackbox: true
  },
  "transactions.$.itemId": {
    type: String,
    optional: true
  },
  "transactions.$.paymentId": {
    type: String,
    optional: true
  },
  "transactions.$.shipmentId": {
    type: String,
    optional: true
  },
  "transactions.$.inventoryId": {
    type: String,
    optional: true
  },
  "transactions.$.createdAt": {
    type: Date,
    autoValue: function () {
      if (this.isUpdate && !this.isSet) {
        return new Date;
      }
      this.unset();
    },
    denyUpdate: true
  }
});
