import faker from "faker";
import _ from "lodash";
import Random from "@reactioncommerce/random";
import { Factory } from "meteor/dburles:factory";
import { Orders, Products } from "/lib/collections";
import { getShop } from "./shops";
import { getUser } from "./users";
import { getAddress } from "./accounts";
import { addProduct } from "./products";

/**
 * @method randomProcessor
 * @memberof Fixtures
 * @summary Return a random payment processor string, either: `"Stripe"` `"Braintree"`
 * @return {String} Name of payment processor
 */
export function randomProcessor() {
  return _.sample(["Stripe", "Braintree"]);
}

const itemIdOne = Random.id();
const itemIdTwo = Random.id();

/**
 * @method randomStatus
 * @memberof Fixtures
 * @summary Return a random payment status, from: `"created", "approved", "failed", "canceled", "expired", "pending", "voided", "settled"`
 * @return {String} Payment status string
 */
export function randomStatus() {
  return _.sample([
    "created",
    "approved",
    "failed",
    "canceled",
    "expired",
    "pending",
    "voided",
    "settled"
  ]);
}

/**
 * @method randomMode
 * @memberof Fixtures
 * @summary Return a random credit card status, from: `"authorize", "capture", "refund", "void"`
 * @return {String} Payment status string
 */
export function randomMode() {
  return _.sample(["authorize", "capture", "refund", "void"]);
}

/**
 * @method getUserId
 * @memberof Fixtures
 * @return {String} ID
 */
export function getUserId() {
  return getUser()._id;
}

/**
 * @method getShopId
 * @memberof Fixtures
 * @return {String} ID
 */
export function getShopId() {
  return getShop()._id;
}

/**
 * @method defineOrders
 * @memberof Fixtures
 * @return {undefined}
 */
export default function defineOrders() {
  const shopId = getShopId();

  /**
   * @name order
   * @memberof Fixtures
   * @summary Create an Order Factory
   * @example order = Factory.create("order")
   * @property {String} status OrderItems - `faker.lorem.sentence(3)`
   * @property {Array} history OrderItems History - `[]`
   * @property {Array} documents OrderItems Document - `[]`
   * @property {String} cartId Order - `Random.id()`
   * @property {Array} notes Order - `[]`
   * @property {String} shopId Cart - `shopId`
   * @property {String} shopId.accountId Cart - `accountId`
   * @property {String} shopId.email Cart - `faker.internet.email()`
   * @property {String} shopId.workflow Cart - Object
   * @property {String} shopId.workflow.status Cart - `"new"`
   * @property {String} shopId.workflow Cart - `"coreOrderWorkflow/created"`
   * @property {Array} shopId.items Array of products
   * @property {String} shopId.items._id Cart - Product - cart ID
   * @property {String} shopId.items.title Cart - Product - `"itemOne"`
   * @property {String} shopId.items.shopId Cart - Product - store ID
   * @property {String} shopId.items.productId Cart - Product - product ID
   * @property {Number} shopId.items.quantity Cart - Product - `1`
   * @property {Object} shopId.items.variants Cart - Product - variants
   * @property {Object} shopId.items.workflow Cart - Product - Object
   * @property {String} shopId.items.workflow.status Cart - Product - `"new"`
   * @property {String[]} supportedFulfillmentTypes - ["shipping"]
   * @property {Array} shipping - Shipping - `[{}]`
   * @property {String[]} shipping.itemIds
   * @property {Object} shipping.payment - A payment
   * @property {String} shipping.payment._id - Billing - `Random.id()`
   * @property {Object} shipping.payment.address - Billing - Address object
   * @property {String} shipping.payment.displayName - `"MasterCard 2346"`
   * @property {String} shipping.payment.method - `"credit"`
   * @property {String} shipping.payment.processor - `"Example"`
   * @property {String} shipping.payment.paymentPluginName - `"example-paymentmethod"`
   * @property {String} shipping.payment.mode - `"authorize"`
   * @property {String} shipping.payment.status - `"created"`
   * @property {Number} shipping.payment.amount - `12.4`
   * @property {Object} shipping.payment.invoice - Object
   * @property {Number} shipping.payment.invoice.total - `12.45`
   * @property {Number} shipping.payment.invoice.subtotal - `12.45`
   * @property {Number} shipping.payment.invoice.discounts - `0`
   * @property {Number} shipping.payment.invoice.taxes - `0.12`
   * @property {Number} shipping.payment.invoice.shipping - `4.0`
   * @property {String} state - `"new"`
   * @property {Date} createdAt - `new Date()`
   * @property {Date} updatedAt - `new Date()`
   */
  Factory.define("order", Orders, {
    // Schemas.OrderItems
    status: faker.lorem.sentence(3),
    history: [],
    documents: [],

    // Schemas.Order
    cartId: Random.id(),
    notes: [],

    // Schemas.Cart
    shopId,
    accountId: Random.id(),
    email: faker.internet.email(),
    workflow: {
      status: "new",
      workflow: [
        "coreOrderWorkflow/created"
      ]
    },
    items() {
      const product = addProduct({ shopId });
      const variant = Products.findOne({ ancestors: [product._id] });
      const childVariants = Products.find({
        ancestors: [
          product._id, variant._id
        ]
      }).fetch();
      const selectedOption = Random.choice(childVariants);
      const product2 = addProduct({ shopId });
      const variant2 = Products.findOne({ ancestors: [product2._id] });
      const childVariants2 = Products.find({
        ancestors: [
          product2._id, variant2._id
        ]
      }).fetch();
      const selectedOption2 = Random.choice(childVariants2);
      return [{
        _id: itemIdOne,
        title: "firstItem",
        shopId: product.shopId,
        productId: product._id,
        quantity: 1,
        product,
        variants: selectedOption,
        workflow: {
          status: "new"
        }
      }, {
        _id: itemIdTwo,
        title: "secondItem",
        shopId: product2.shopId,
        productId: product2._id,
        quantity: 1,
        product: product2,
        variants: selectedOption2,
        workflow: {
          status: "new"
        }
      }];
    },
    supportedFulfillmentTypes: ["shipping"],
    shipping: [{
      address: getAddress({ isShippingDefault: true }),
      invoice: {
        total: 12.45,
        subtotal: 12.45,
        discounts: 0,
        taxes: 0.12,
        shipping: 4.00
      },
      itemIds: [itemIdOne, itemIdTwo],
      payment: {
        _id: Random.id(),
        address: getAddress({ isBillingDefault: true }),
        amount: 12.45,
        displayName: "MasterCard 2346",
        invoice: {
          total: 12.45,
          subtotal: 12.45,
          discounts: 0,
          taxes: 0.12,
          shipping: 4.00
        },
        method: "credit",
        mode: "authorize",
        paymentPluginName: "example-paymentmethod",
        processor: "Example",
        status: "created",
        shopId
      },
      shopId
    }], // fulfillment group Schema
    state: "new",
    createdAt: new Date(),
    updatedAt: new Date()
  });
}
