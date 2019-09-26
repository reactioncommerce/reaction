import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";
import { createdAtAutoValue } from "./helpers";
import { Address } from "./address";
import { Money, AppliedSurcharge } from "./core";
import { Invoice, Payment } from "./payments";
import { ShippingParcel } from "./shipping";
import { Workflow } from "./workflow";


/**
 * @name AnonymousAccessToken
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {Date} createdAt when token was created
 * @property {String} hashedToken token hash = base64(sha256(token-random-string))
 */
export const AnonymousAccessToken = new SimpleSchema({
  createdAt: Date,
  hashedToken: String
});
registerSchema("AnonymousAccessToken", AnonymousAccessToken);

/**
 * @name Document
 * @memberof Schemas
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
 * @memberof Schemas
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
 * @name ExportHistory
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} status (required) Whether the export attempt succeeded or failed
 * @property {Date} dateAttempted (required) Date the export was attempted
 * @property {String} exportMethod (required) Name of the export method (e.g. CSV, Shopify)
 * @property {String} destinationIdentifier The identifier for this order on the remote system
 * @property {String} shopId (required) The shop ID
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
 * @memberof Schemas
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
 * @name SelectedFulfillmentOption
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id Shipment method Id
 * @property {String} carrier optional
 * @property {String} currencyCode Currency code for interpreting rate and handling
 * @property {String} group Group, allowed values: `Ground`, `Priority`, `One Day`, `Free`
 * @property {Number} handling optional, default value: `0`
 * @property {String} label Public label
 * @property {String} name Method name
 * @property {Number} rate Rate
 */
export const SelectedFulfillmentOption = new SimpleSchema({
  _id: String,
  carrier: {
    type: String,
    optional: true
  },
  currencyCode: String,
  group: {
    type: String,
    optional: true
  },
  handling: {
    type: Number,
    min: 0
  },
  label: String,
  name: String,
  rate: {
    type: Number,
    min: 0
  }
});

/**
 * @name OrderDiscount
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {Number} amount Amount of discount applied to the order
 * @property {String} discountId Discount ID
 */
export const OrderDiscount = new SimpleSchema({
  amount: Number,
  discountId: String
});

/**
 * @name OrderItemAttribute
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} label required
 * @property {String} value optional
 */
export const OrderItemAttribute = new SimpleSchema({
  label: String,
  value: {
    type: String,
    optional: true
  }
});

/**
 * @name OrderItem
 * @memberof Schemas
 * @summary Defines one item in an order
 * @type {SimpleSchema}
 * @property {String} _id Unique ID for the item
 * @property {String} addedAt Date/time when this was first added to the cart/order
 * @property {OrderItemAttribute[]} attributes Attributes of this item
 * @property {String} cancelReason Free text reason for cancel, if this item is canceled
 * @property {String} createdAt Date/time when this order item was created
 * @property {Document[]} documents optional
 * @property {History[]} history optional
 * @property {String} optionTitle optionTitle from the selected variant
 * @property {ShippingParcel} parcel Currently, parcel is in simple product schema. Need to include it here as well.
 * @property {Money} price The price+currency of variantId at the moment the related order was placed
 * @property {String} productId required
 * @property {String} productSlug Product slug
 * @property {String} productType Product type
 * @property {String} productVendor Product vendor
 * @property {Number} quantity required
 * @property {String} shopId The owner shop
 * @property {Number} subtotal The item subtotal, quantity x price
 * @property {String} title Title from the selected product
 * @property {String} updatedAt required
 * @property {String} variantId required
 * @property {String} variantTitle Title from the selected variant
 * @property {Workflow} workflow optional
 *
 */
export const OrderItem = new SimpleSchema({
  "_id": String,
  "addedAt": Date,
  "attributes": {
    type: Array,
    optional: true
  },
  "attributes.$": OrderItemAttribute,
  "cancelReason": {
    type: String,
    optional: true
  },
  "createdAt": Date,
  "documents": {
    type: Array,
    optional: true
  },
  "documents.$": {
    type: Document
  },
  "history": {
    type: Array,
    optional: true
  },
  "history.$": {
    type: History
  },
  "optionTitle": {
    type: String,
    optional: true
  },
  "parcel": {
    type: ShippingParcel,
    optional: true
  },
  "price": Money,
  "productId": String,
  "productSlug": {
    type: String,
    optional: true
  },
  "productType": {
    label: "Product Type",
    type: String,
    optional: true
  },
  "productTagIds": {
    label: "Product Tags",
    type: Array,
    optional: true
  },
  "productTagIds.$": String,
  "productVendor": {
    label: "Product Vendor",
    type: String,
    optional: true
  },
  "quantity": {
    label: "Quantity",
    type: SimpleSchema.Integer,
    min: 0
  },
  "shopId": String,
  "subtotal": Number,
  "title": String,
  "updatedAt": Date,
  "variantId": {
    type: String,
    optional: true
  },
  "variantTitle": {
    type: String,
    optional: true
  },
  "workflow": {
    type: Workflow,
    optional: true,
    defaultValue: {}
  }
});

registerSchema("OrderItem", OrderItem);

/**
 * @name OrderTransaction Schema
 * @memberof Schemas
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
});

registerSchema("OrderTransaction", OrderTransaction);

/**
 * @name OrderFulfillmentGroup Schema
 * @memberof Schemas
 * @summary One fulfillment group of an order
 * @type {SimpleSchema}
 * @property {String} _id Group ID
 * @property {Object} address Shipping address
 * @property {String} customsLabelUrl URL for customs label
 * @property {Object} invoice Invoice (same as the one on Payment)
 * @property {Object[]} items The order items in this group
 * @property {String[]} itemIds For convenience, the _id of all the items
 * @property {Object} payment The payment info for this group
 * @property {Object} shipmentMethod The fulfillment method that was chosen by the customer
 * @property {String} shippingLabelUrl URL for shipping label
 * @property {String} shopId The shop that fulfills this group
 * @property {Number} totalItemQuantity The total item quantity, sum of all quantities
 * @property {String} tracking Tracking reference ID
 * @property {String} trackingUrl Tracking URL
 * @property {String} type Fulfillment type
 * @property {Object} workflow Current status and past statuses for this fulfillment
 */
export const OrderFulfillmentGroup = new SimpleSchema({
  "_id": String,
  "address": {
    type: Address,
    optional: true
  },
  "customsLabelUrl": {
    type: String,
    optional: true
  },
  "invoice": Invoice,
  "items": {
    type: Array,
    minCount: 1
  },
  "items.$": OrderItem,
  "itemIds": [String],
  "shipmentMethod": SelectedFulfillmentOption,
  "shippingLabelUrl": {
    type: String,
    optional: true
  },
  "shopId": String,
  "totalItemQuantity": {
    type: SimpleSchema.Integer,
    min: 1
  },
  "tracking": {
    type: String,
    optional: true
  },
  "trackingUrl": {
    type: String,
    optional: true
  },
  "type": {
    type: String,
    allowedValues: ["shipping"]
  },
  "updatedAt": {
    type: Date,
    optional: true
  },
  "workflow": Workflow
});

/**
 * @name Order Schema
 * @memberof Schemas
 * @type {SimpleSchema}
 * @summary Order has an array of History, Documents, Notes, Items and OrderTransactions.
 * @property {String} _id required
 * @property {String} accountId Account ID for account orders, or null for anonymous
 * @property {Object[]} anonymousAccessTokens Tokens for accessing anonymous orders, null for account orders
 * @property {String} anonymousAccessTokens.hashedToken The hashed value for DB queries
 * @property {Date} anonymousAccessTokens.createdAt When the token was created. Expiry is not currently implemented, but this Date is here to support that.
 * @property {Address} [billingAddress] Optional billing address
 * @property {String} cartId optional For tracking which cart created this order
 * @property {Date} createdAt required
 * @property {String} currencyCode required
 * @property {Object} customFields optional
 * @property {Document[]} documents optional
 * @property {String} email optional
 * @property {Object[]} exportHistory optional
 * @property {History[]} history optional
 * @property {Notes[]} notes optional
 * @property {Payment[]} payments Array of payments
 * @property {Shipment[]} shipping Array of fulfillment groups
 * @property {String} shopId required The owner shop
 * @property {Surcharges[]} surcharges Surcharges applied to this order
 * @property {OrderTransaction[]} transactions optional
 * @property {Date} updatedAt optional
 * @property {Workflow} workflow optional
 */
export const Order = new SimpleSchema({
  "_id": {
    type: String,
    optional: true
  },
  "accountId": {
    type: String,
    optional: true
  },
  "anonymousAccessTokens": {
    type: Array,
    optional: true
  },
  "anonymousAccessTokens.$": AnonymousAccessToken,
  // Although billing address is typically needed only by the payment plugin,
  // some tax services require it to calculate taxes for digital items. Thus
  // it should be provided here in order to be added to the CommonOrder if possible.
  "billingAddress": {
    type: Address,
    optional: true
  },
  "cartId": {
    type: String,
    optional: true
  },
  "createdAt": Date,
  "currencyCode": String,
  "customFields": {
    type: Object,
    blackbox: true,
    optional: true
  },
  "discounts": {
    type: Array,
    optional: true
  },
  "discounts.$": OrderDiscount,
  "documents": {
    type: Array,
    optional: true
  },
  "documents.$": Document,
  "email": {
    type: String,
    optional: true,
    regEx: SimpleSchema.RegEx.Email
  },
  "exportHistory": {
    type: Array,
    optional: true
  },
  "exportHistory.$": ExportHistory,
  "history": {
    type: Array,
    optional: true
  },
  "history.$": History,
  "notes": {
    type: Array,
    optional: true
  },
  "notes.$": Notes,
  "ordererPreferredLanguage": {
    type: String,
    optional: true
  },
  "payments": {
    type: Array,
    optional: true
  },
  "payments.$": Payment,
  "referenceId": {
    type: String
  },
  "shipping": [OrderFulfillmentGroup],
  "shopId": String,
  "surcharges": {
    type: Array,
    optional: true
  },
  "surcharges.$": {
    type: AppliedSurcharge
  },
  "totalItemQuantity": {
    type: SimpleSchema.Integer,
    min: 1
  },
  "transactions": {
    type: Array,
    optional: true
  },
  "transactions.$": OrderTransaction,
  "updatedAt": {
    type: Date,
    optional: true
  },
  "workflow": {
    type: Workflow,
    optional: true,
    defaultValue: {}
  }
});

registerSchema("Order", Order);
