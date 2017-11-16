import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Workflow } from "./workflow";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
 * @name Document
 * @memberof schemas
 * @type {SimpleSchema}
 * @property {String} docId required
 * @property {String} docType optional
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
 * @name History
 * @memberof schemas
 * @type {SimpleSchema}
 * @property {String} event required
 * @property {String} value required
 * @property {String} userId required
 * @property {String} updatedAt required
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
 * @name Notes
 * @memberof schemas
 * @type {SimpleSchema}
 * @property {String} content required
 * @property {String} userId required
 * @property {Date} updatedAt required
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
 * @name OrderItems
 * @memberof schemas
 * @summary Merges with Cart and Order to create Orders collection
 * @type {SimpleSchema}
 * @property {String} additionalField optional
 * @property {Workflow} workflow optional
 * @property {History[]} history optional
 * @property {Document[]} documents optional
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
 * @name OrderTransaction Schema
 * @memberof schemas
 * @summary Order transactions tie Shipping, Payment, and Inventory transactions
 * @type {SimpleSchema}
 * @property {String} itemId optional
 * @property {String} paymentId optional
 * @property {String} shipmentId optional
 * @property {String} inventoryId optional
 * @property {Date} createdAt required
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
 * @name Order Schema
 * @memberof schemas
 * @type {SimpleSchema}
 * @summary Order ties a User to a Cart and an array of History, Documents, Notes, Items and OrderTransactions.
 * @property {String} userId required
 * @property {String} cartId optional
 * @property {History[]} history optional
 * @property {Document[]} documents optional
 * @property {Notes[]} notes optional
 * @property {OrderItem[]} items optional
 * @property {OrderTransaction[]} transactions optional
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
