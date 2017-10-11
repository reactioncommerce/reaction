import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { shopIdAutoValueForCart } from "./helpers";
import { Payment } from "./payments";
import { Product, ProductVariant } from "./products";
import { Shipment, ShippingParcel } from "./shipping";
import { Workflow } from "./workflow";
import { Metafield } from "./metafield";
import { registerSchema } from "@reactioncommerce/reaction-collections";

/**
 * CartItem Schema
 */

export const CartItem = new SimpleSchema({
  _id: {
    type: String
  },
  productId: {
    type: String,
    index: 1
  },
  shopId: {
    type: String,
    autoValue: shopIdAutoValueForCart,
    index: 1,
    label: "Cart Item shopId",
    optional: true
  },
  quantity: {
    label: "Quantity",
    type: Number,
    min: 0
  },
  product: {
    type: Product
  },
  variants: {
    type: ProductVariant
  },
  metafields: {
    type: [Metafield],
    optional: true
  },
  title: {
    type: String,
    label: "CartItem Title"
  },
  type: {
    label: "Product Type",
    type: String,
    optional: true
  },
  parcel: { // Currently the parcel is in the simple product schema, so we need to include it here as well. Maybe it should go in productvariant
    type: ShippingParcel,
    optional: true
  },
  cartItemId: { // Seems strange here but has to be here since we share schemas between cart and order
    type: String,
    optional: true
  },
  transaction: { // Transaction associated with this item.
    type: Object,
    optional: true,
    blackbox: true
  },
  taxData: {
    type: Object,
    optional: true,
    blackbox: true
  },
  taxRate: {
    type: Number,
    decimal: true,
    optional: true
  },
  shippingMethod: { // Shipping Method associated with this item
    type: Object,
    optional: true,
    blackbox: true // Revert this to schema at some point
  }
});

registerSchema("CartItem", CartItem);

/**
 * CartItem Schema
 * used in check by inventory/addReserve method
 */

export const CartItems = new SimpleSchema({
  items: {
    type: [CartItem],
    optional: true
  }
});

registerSchema("CartItems", CartItems);

/**
 * Cart Schema
 */

export const Cart = new SimpleSchema({
  _id: { // required for check of users' carts
    type: String,
    optional: true
  },
  shopId: {
    type: String,
    autoValue: shopIdAutoValueForCart,
    index: 1,
    label: "Cart ShopId"
  },
  userId: {
    type: String,
    unique: true,
    autoValue: function () {
      if (this.isInsert || this.isUpdate) {
        if (!this.isFromTrustedCode) {
          return this.userId;
        }
      } else {
        this.unset();
      }
    }
  },
  sessionId: {
    type: String,
    index: 1
  },
  email: {
    type: String,
    optional: true,
    index: 1,
    regEx: SimpleSchema.RegEx.Email
  },
  items: {
    type: [CartItem],
    optional: true
  },
  shipping: {
    type: [Shipment],
    optional: true,
    blackbox: true
  },
  billing: {
    type: [Payment],
    optional: true,
    blackbox: true
  },
  // This is the taxRate
  tax: {
    type: Number,
    decimal: true,
    optional: true
  },
  taxes: {
    type: [Object],
    optional: true,
    blackbox: true
  },
  taxRatesByShop: {
    type: Object,
    optional: true,
    blackbox: true
  },
  discount: {
    type: Number,
    decimal: true,
    optional: true
  },
  workflow: {
    type: Workflow,
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
    autoValue: function () {
      if (this.isUpdate) {
        return {
          $set: new Date
        };
      } else if (this.isUpsert) {
        return {
          $setOnInsert: new Date
        };
      }
    },
    optional: true
  }
});

registerSchema("Cart", Cart);
