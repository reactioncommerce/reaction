import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Workflow } from "./workflow";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
 * Order Document Schema
 */

export const Document = new SimpleSchema({
  docId: {
    type: String
  },
  docType: {
    type: String,
    optional: true
  }
});

registerSchema("Document", Document);

/**
 * Order History Schema
 */

export const History = new SimpleSchema({
  event: {
    type: String
  },
  value: {
    type: String
  },
  userId: {
    type: String
  },
  updatedAt: {
    type: Date
  }
});

registerSchema("History", History);

/**
 * Order Notes Schema
 */

export const Notes = new SimpleSchema({
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

registerSchema("Notes", Notes);

/**
 * OrderItems Schema
 * merges with Cart and Order to create Orders collection
 */
export const OrderItem = new SimpleSchema({
  additionalField: {
    type: String,
    optional: true
  },
  workflow: {
    type: Workflow,
    optional: true
  },
  history: {
    type: [History],
    optional: true
  },
  documents: {
    type: [Document],
    optional: true
  }
});

registerSchema("OrderItem", OrderItem);


/**
 * OrderTransaction Schema
 * order transactions tie shipping, billing, and inventory transactions
 */
export const OrderTransaction = new SimpleSchema({
  itemId: {
    type: String,
    optional: true
  },
  paymentId: {
    type: String,
    optional: true
  },
  shipmentId: {
    type: String,
    optional: true
  },
  inventoryId: {
    type: String,
    optional: true
  },
  createdAt: {
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

registerSchema("OrderTransaction", OrderTransaction);

/**
 * Order Schema
 */
export const Order = new SimpleSchema({
  userId: {
    type: String,
    unique: false
  },
  cartId: {
    type: String,
    optional: true
  },
  history: {
    type: [History],
    optional: true
  },
  documents: {
    type: [Document],
    optional: true
  },
  notes: {
    type: [Notes],
    optional: true
  },
  items: {
    type: [OrderItem],
    optional: true
  },
  transactions: {
    type: [OrderTransaction],
    optional: true
  }
});

registerSchema("Order", Order);
