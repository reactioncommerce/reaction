import SimpleSchema from "simpl-schema";
import { registerSchema } from "@reactioncommerce/schemas";
import { Address } from "./address";
import { Shipment, ShippingParcel } from "./shipping";
import { Workflow } from "./workflow";
import { Metafield } from "./metafield";

const Money = new SimpleSchema({
  currencyCode: String,
  amount: {
    type: Number,
    min: 0
  }
});

/**
 * @name CartItemAttribute
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} label optional
 * @property {String} value optional
 */
const CartItemAttribute = new SimpleSchema({
  label: {
    type: String,
    optional: true
  },
  value: {
    type: String,
    optional: true
  }
});

/**
 * @name CartItem
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id required
 * @property {String} addedAt required
 * @property {CartItemAttribute[]} attributes Attributes of this item
 * @property {String} createdAt required
 * @property {Metafield[]} metafields
 * @property {String} optionTitle optionTitle from the selected variant
 * @property {ShippingParcel} parcel Currently, parcel is in simple product schema. Need to include it here as well.
 * @property {Money} priceWhenAdded The price+currency at the moment this item was added to this cart
 * @property {String} productId required
 * @property {String} productSlug Product slug
 * @property {String} productType Product type
 * @property {String} productVendor Product vendor
 * @property {Number} quantity required
 * @property {String} shopId Cart Item shopId
 * @property {Object} taxData optional blackbox
 * @property {Number} taxRate optional The rate that was multiplied by the item subtotal to get the item tax
 * @property {String} title Cart Item title
 * @property {Object} transaction Transaction associated with this item
 * @property {String} updatedAt required
 * @property {String} variantId required
 * @property {String} variantTitle Title from the selected variant
 */
export const CartItem = new SimpleSchema({
  "_id": String,
  "addedAt": Date,
  "attributes": {
    type: Array,
    optional: true
  },
  "attributes.$": CartItemAttribute,
  "createdAt": Date,
  "isTaxable": {
    type: Boolean,
    defaultValue: false
  },
  "metafields": {
    type: Array,
    optional: true
  },
  "metafields.$": Metafield,
  "optionTitle": {
    type: String,
    optional: true
  },
  "parcel": {
    type: ShippingParcel,
    optional: true
  },
  "priceWhenAdded": Money,
  "productId": {
    type: String,
    index: 1
  },
  "productSlug": {
    type: String,
    optional: true
  },
  "productType": {
    label: "Product Type",
    type: String,
    optional: true
  },
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
  "shopId": {
    type: String,
    index: 1,
    label: "Cart Item shopId"
  },
  "tax": {
    type: Number,
    optional: true
  },
  "taxCode": {
    type: String,
    optional: true
  },
  "taxData": {
    type: Object,
    optional: true,
    blackbox: true
  },
  "taxRate": {
    type: Number,
    optional: true
  },
  "title": {
    type: String,
    label: "CartItem Title"
  },
  "transaction": {
    type: Object,
    optional: true,
    blackbox: true
  },
  "updatedAt": Date,
  "variantId": {
    type: String,
    index: 1,
    optional: true
  },
  "variantTitle": {
    type: String,
    optional: true
  }
});

registerSchema("CartItem", CartItem);

/**
 * @name CartItems
 * @memberof Schemas
 * @summary Used in check by inventory/addReserve method
 * @type {SimpleSchema}
 * @property {CartItem[]} items an Array of CartItem optional
 */
export const CartItems = new SimpleSchema({
  "items": {
    type: Array,
    optional: true
  },
  "items.$": {
    type: CartItem
  }
});

registerSchema("CartItems", CartItems);

/**
 * @name Cart
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} _id required for check of users' carts
 * @property {String} shopId required, Cart ShopId
 * @property {String} accountId Account ID for account carts, or null for anonymous
 * @property {String} anonymousAccessToken Token for accessing anonymous carts, null for account carts
 * @property {String} email optional
 * @property {CartItem[]} items Array of CartItem optional
 * @property {Shipment[]} shipping Array of Shipment optional, blackbox
 * @property {Payment[]} billing Array of Payment optional, blackbox
 * @property {String} sessionId Optional and deprecated
 * @property {Number} tax tax rate
 * @property {Number} discount optional
 * @property {Workflow} workflow optional
 * @property {Date} createdAt required
 * @property {Date} updatedAt optional
 */
export const Cart = new SimpleSchema({
  "_id": {
    type: String,
    optional: true
  },
  "shopId": {
    type: String,
    index: 1,
    label: "Cart ShopId"
  },
  "accountId": {
    type: String,
    index: 1,
    optional: true
  },
  "anonymousAccessToken": {
    type: String,
    index: 1,
    optional: true
  },
  "currencyCode": String,
  "billingAddress": {
    type: Address,
    optional: true
  },
  "sessionId": {
    type: String,
    index: 1,
    optional: true
  },
  "email": {
    type: String,
    optional: true,
    index: 1,
    regEx: SimpleSchema.RegEx.Email
  },
  "items": {
    type: Array,
    optional: true
  },
  "items.$": {
    type: CartItem
  },
  "shipping": {
    type: Array,
    optional: true
  },
  "shipping.$": {
    type: Shipment
  },
  /* Working to get rid of cart.billing, but currently still where discounts are applied to carts */
  "billing": {
    type: Array,
    optional: true
  },
  "billing.$": {
    type: Object,
    blackbox: true
  },
  "taxCalculationFailed": {
    type: Boolean,
    optional: true,
    defaultValue: false
  },
  "bypassAddressValidation": {
    type: Boolean,
    optional: true,
    defaultValue: false
  },
  "discount": {
    type: Number,
    optional: true
  },
  "workflow": {
    type: Workflow,
    optional: true,
    defaultValue: {}
  },
  "createdAt": {
    type: Date
  },
  "updatedAt": {
    type: Date,
    optional: true
  }
});

registerSchema("Cart", Cart);
