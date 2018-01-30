import SimpleSchema from "simpl-schema";
import { check } from "meteor/check";
import { Tracker } from "meteor/tracker";
import { registerSchema } from "@reactioncommerce/reaction-collections";
import { createdAtAutoValue, shopIdAutoValueForCart, updatedAtAutoValue } from "./helpers";
import { Payment } from "./payments";
import { Product, ProductVariant } from "./products";
import { Shipment, ShippingParcel } from "./shipping";
import { Workflow } from "./workflow";
import { Metafield } from "./metafield";

/**
 * @name CartItem
 * @memberof schemas
 * @type {SimpleSchema}
 * @property {String} _id required
 * @property {String} productId required
 * @property {String} shopId, Cart Item shopId
 * @property {Number} quantity required
 * @property {Product} product required
 * @property {ProductVariant} variants required
 * @property {Metafield[]} metafields
 * @property {String} title Cart Item title
 * @property {String} type, Product type
 * @property {ShippingParcel} parcel Currently, parcel is in simple product schema. Need to include it here as well.
 * @property {String} cartItemId Seems strange here but has to be here since we share schemas between Cart and Order
 * @property {Object} transaction Transaction associated with this item
 * @property {Object} taxData optional blackbox
 * @property {Number} taxRate optional
 * @property {Object} shippingMethod Shipping Method associated with this item
 */
export const CartItem = new SimpleSchema({
  "_id": {
    type: String
  },
  "productId": {
    type: String,
    index: 1
  },
  "shopId": {
    type: String,
    autoValue: shopIdAutoValueForCart,
    index: 1,
    label: "Cart Item shopId",
    optional: true
  },
  "quantity": {
    label: "Quantity",
    type: SimpleSchema.Integer,
    min: 0
  },
  "product": {
    type: Product
  },
  "variants": {
    type: ProductVariant
  },
  "metafields": {
    type: Array,
    optional: true
  },
  "metafields.$": {
    type: Metafield
  },
  "title": {
    type: String,
    label: "CartItem Title"
  },
  "type": {
    label: "Product Type",
    type: String,
    optional: true
  },
  "parcel": {
    type: ShippingParcel,
    optional: true
  },
  "cartItemId": {
    type: String,
    optional: true
  },
  "transaction": {
    type: Object,
    optional: true,
    blackbox: true
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
  "shippingMethod": {
    type: Object,
    optional: true,
    blackbox: true // @todo Revert this to schema at some point
  }
}, { check, tracker: Tracker });

registerSchema("CartItem", CartItem);

/**
 * @name CartItems
 * @memberof schemas
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
}, { check, tracker: Tracker });

registerSchema("CartItems", CartItems);

/**
 * @name Cart
 * @memberof schemas
 * @type {SimpleSchema}
 * @property {String} _id required for check of users' carts
 * @property {String} shopId required, Cart ShopId
 * @property {String} userId required
 * @property {String} sessionId required
 * @property {String} email optional
 * @property {CartItem[]} items Array of CartItem optional
 * @property {Shipment[]} shipping Array of Shipment optional, blackbox
 * @property {Payment[]} billing Array of Payment optional, blackbox
 * @property {Number} tax tax rate
 * @property {Object[]} taxes Array of objects optional
 * @property {Object} taxRatesByShop optional
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
    autoValue: shopIdAutoValueForCart,
    index: 1,
    label: "Cart ShopId"
  },
  "userId": {
    type: String,
    unique: true,
    autoValue() {
      if (this.isInsert || this.isUpdate) {
        if (!this.isFromTrustedCode) {
          return this.userId;
        }
      } else {
        this.unset();
      }
    }
  },
  "sessionId": {
    type: String,
    index: 1
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
  "billing": {
    type: Array,
    optional: true
  },
  "billing.$": {
    type: Payment
  },
  "tax": {
    type: Number,
    optional: true
  },
  "taxes": {
    type: Array,
    optional: true
  },
  "taxes.$": {
    type: Object,
    blackbox: true
  },
  "taxRatesByShop": {
    type: Object,
    optional: true,
    blackbox: true
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
    type: Date,
    autoValue: createdAtAutoValue
  },
  "updatedAt": {
    type: Date,
    autoValue: updatedAtAutoValue,
    optional: true
  }
}, { check, tracker: Tracker });

registerSchema("Cart", Cart);
