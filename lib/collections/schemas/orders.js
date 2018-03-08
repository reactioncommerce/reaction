import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { registerSchema } from "@reactioncommerce/reaction-collections";
import { createdAtAutoValue } from "./helpers";
import { Cart, CartItem } from "./cart";
import { Workflow } from "./workflow";

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
}, { check, tracker: Tracker });

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
}, { check, tracker: Tracker });

registerSchema("History", History);

/**
 * @name ExportHistory
 * @memberof schemas
 * @type {SimpleSchema}
 * @property {String} required Whether the export attempt succeeded or failed
 * @property {Date} required Date the export was attempted
 * @property {String} required Name of the export method (e.g. CSV, Shopify)
 * @property {String} optional The identifier for this order on the remote system
 */
export const ExportHistory = new SimpleSchema({
  status: {
    type: String,
    allowedValues: ["success", "failure"]
  },
  dateAttempted: {
    type: Date
  },
  exportMethod: {
    type: String
  },
  destinationIdentifier: {
    type: String,
    optional: true
  },
  shopId: {
    type: String
  }
});

registerSchema("ExportHistory", ExportHistory);

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
}, { check, tracker: Tracker });

registerSchema("Notes", Notes);

/**
 * @name OrderItem
 * @memberof schemas
 * @summary CartItem + some additional properties
 * @type {SimpleSchema}
 * @property {String} additionalField optional
 * @property {Workflow} workflow optional
 * @property {History[]} history optional
 * @property {Document[]} documents optional
*/
export const OrderItem = new SimpleSchema({
  "additionalField": {
    type: String,
    optional: true
  },
  "workflow": {
    type: Workflow,
    optional: true,
    defaultValue: {}
  },
  "history": {
    type: Array,
    optional: true
  },
  "history.$": {
    type: History
  },
  "documents": {
    type: Array,
    optional: true
  },
  "documents.$": {
    type: Document
  }
}, { check, tracker: Tracker });

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
    autoValue: createdAtAutoValue
  }
}, { check, tracker: Tracker });

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
  "userId": {
    type: String,
    unique: false
  },
  "cartId": {
    type: String,
    optional: true
  },
  "history": {
    type: Array,
    optional: true
  },
  "history.$": {
    type: History
  },
  "documents": {
    type: Array,
    optional: true
  },
  "documents.$": {
    type: Document
  },
  "notes": {
    type: Array,
    optional: true
  },
  "notes.$": Notes,
  "items": {
    type: Array,
    optional: true
  },
  "items.$": CartItem.clone().extend(OrderItem),
  "transactions": {
    type: Array,
    optional: true
  },
  "transactions.$": OrderTransaction,
  "exportHistory": {
    type: Array,
    optional: true
  },
  "exportHistory.$": ExportHistory
}, { check, tracker: Tracker });

registerSchema("Order", Order);

export const OrderDocument = Cart.clone().extend(Order).extend(OrderItem);
registerSchema("OrderDocument", OrderDocument);
