import SimpleSchema from "simpl-schema";
import { Address, ShippingParcel } from "/imports/collections/schemas";

const Money = new SimpleSchema({
  currencyCode: String,
  amount: {
    type: Number,
    min: 0
  }
});

/**
 * @name CommonOrderItemAttribute
 * @memberof Schemas
 * @type {SimpleSchema}
 * @property {String} label optional
 * @property {String} value optional
 */
export const CommonOrderItemAttribute = new SimpleSchema({
  label: {
    type: String,
    optional: true
  },
  value: {
    type: String,
    optional: true
  }
});

export const CommonOrderItem = new SimpleSchema({
  "_id": String,
  "attributes": {
    type: Array,
    optional: true
  },
  "attributes.$": CommonOrderItemAttribute,
  "isTaxable": {
    type: Boolean,
    optional: true
  },
  "parcel": {
    type: ShippingParcel,
    optional: true
  },
  "price": Money,
  "productId": String,
  "productVendor": {
    type: String,
    optional: true
  },
  "quantity": {
    type: SimpleSchema.Integer,
    min: 0
  },
  "shopId": String,
  "subtotal": Money,
  "taxCode": {
    type: String,
    optional: true
  },
  "title": String,
  "variantId": String,
  "variantTitle": {
    type: String,
    optional: true
  }
});

const CommonOrderFulfillmentPrices = new SimpleSchema({
  handling: {
    type: Money,
    optional: true
  },
  shipping: {
    type: Money,
    optional: true
  },
  total: {
    type: Money,
    optional: true
  }
});

const CommonOrderTotals = new SimpleSchema({
  groupDiscountTotal: {
    type: Money,
    optional: true
  },
  groupItemTotal: {
    type: Money,
    optional: true
  },
  groupTotal: {
    type: Money,
    optional: true
  },
  orderDiscountTotal: {
    type: Money,
    optional: true
  },
  orderItemTotal: {
    type: Money,
    optional: true
  },
  orderTotal: {
    type: Money,
    optional: true
  }
});

/**
 * @type {SimpleSchema}
 * @summary The CommonOrder schema describes an order for a single shop, containing only
 *   properties that can be provided by a Cart as well. Each fulfillment group in a Cart
 *   or Order can be transformed into a single CommonOrder. This allows plugins that
 *   operate on both cart and order to provide only a single function, accepting a CommonOrder,
 *   where the caller can transform and store the result as necessary for either Cart or Order.
 *   For example, tax services accept a CommonOrder and calculate taxes without knowing or
 *   caring whether it is for a Cart or an Order.
 */
export const CommonOrder = new SimpleSchema({
  billingAddress: {
    type: Address,
    optional: true
  },
  cartId: {
    type: String,
    optional: true
  },
  currencyCode: String,
  fulfillmentMethodId: {
    type: String,
    optional: true
  },
  fulfillmentPrices: CommonOrderFulfillmentPrices,
  fulfillmentType: {
    type: String,
    allowedValues: ["shipping"]
  },
  items: [CommonOrderItem],
  orderId: {
    type: String,
    optional: true
  },
  originAddress: {
    type: Address,
    optional: true
  },
  shippingAddress: {
    type: Address,
    optional: true
  },
  shopId: String,
  sourceType: {
    type: String,
    allowedValues: ["cart", "order"]
  },
  totals: {
    type: CommonOrderTotals,
    optional: true
  }
});

export const orderItemInputSchema = new SimpleSchema({
  "addedAt": {
    type: Date,
    optional: true
  },
  "price": Number,
  "productConfiguration": Object,
  "productConfiguration.productId": String,
  "productConfiguration.productVariantId": String,
  "quantity": {
    type: SimpleSchema.Integer,
    min: 1
  }
});

export const orderFulfillmentGroupInputSchema = new SimpleSchema({
  "data": {
    type: Object,
    blackbox: true,
    optional: true
  },
  "items": {
    type: Array,
    minCount: 1
  },
  "items.$": orderItemInputSchema,
  "selectedFulfillmentMethodId": String,
  "shopId": String,
  "totalPrice": {
    type: Number,
    optional: true
  },
  "type": {
    type: String,
    allowedValues: ["shipping"]
  }
});

// Exported for unit tests
export const orderInputSchema = new SimpleSchema({
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
  "currencyCode": String,
  /**
   * If you need to store customFields, be sure to add them to your
   * GraphQL input schema and your Order SimpleSchema with proper typing.
   * This schema need not care what `customFields` is because the input
   * and Order schemas will validate. Thus, we use blackbox here.
   */
  "customFields": {
    type: Object,
    blackbox: true,
    optional: true
  },
  "email": String,
  "fulfillmentGroups": {
    type: Array,
    minCount: 1
  },
  "fulfillmentGroups.$": orderFulfillmentGroupInputSchema,
  "shopId": String
});

export const paymentInputSchema = new SimpleSchema({
  amount: Number,
  // Optionally override the order.billingAddress for each payment
  billingAddress: {
    type: Address,
    optional: true
  },
  data: {
    type: Object,
    optional: true,
    blackbox: true
  },
  method: String
});
