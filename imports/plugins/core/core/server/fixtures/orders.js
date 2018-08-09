import faker from "faker";
import _ from "lodash";
import Random from "@reactioncommerce/random";
import { Factory } from "meteor/dburles:factory";
import { Orders, Products } from "/lib/collections";
import { getShop } from "./shops";
import { getUser } from "./users";
import { getPkgData } from "./packages";
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
 * @method paymentMethod
 * @memberof Fixtures
 * @summary Create Payment Method object
 * @param {Object} doc Override props
 * @return {Object} Payment method object
 * @property {String} processor - `randomProcessor()`
 * @property {String} storedCard - `"4242424242424242"`
 * @property {String} transactionId - `Random.id()`
 * @property {String} status - `randomStatus()`
 * @property {String} mode - `randomMode()`
 * @property {String} authorization - `"auth field"`
 * @property {Number} amount - `faker.commerce.price()`
 */
export function paymentMethod(doc) {
  return {
    ...doc,
    processor: doc.processor ? doc.processor : randomProcessor(),
    storedCard: doc.storedCard ? doc.storedCard : "4242424242424242",
    transactionId: doc.transactionId ? doc.transactionId : Random.id(),
    status: doc.status ? doc.status : randomStatus(),
    mode: doc.mode ? doc.mode : randomMode(),
    authorization: "auth field",
    amount: doc.amount ? doc.amount : faker.commerce.price()
  };
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
   * @property {Boolean} requiresShipping - `true`
   * @property {Array} shipping - Shipping - `[{}]`
   * @property {String[]} itemIds
   * @property {Array} billing - Billing - `[]`
   * @property {String} billing._id - Billing - `Random.id()`
   * @property {Object} billing.address - Billing - Address object
   * @property {Object} billing.paymentMethod - Billing - Payment Method
   * @property {String} billing.paymentMethod.method - `"credit"`
   * @property {String} billing.paymentMethod.processor - `"Example"`
   * @property {String} billing.paymentMethod.storedCard - `"MasterCard 2346"`
   * @property {String} billing.paymentMethod.paymentPackageId - `getPkgData("example-paymentmethod")._id`
   * @property {String} paymentSettingsKey - `"example-paymentmethod"`
   * @property {String} mode - `"authorize"`
   * @property {String} status - `"created"`
   * @property {Number} amount - `12.4`
   * @property {Object} invoice - Object
   * @property {Number} invoice.total - `12.45`
   * @property {Number} invoice.subtotal - `12.45`
   * @property {Number} invoice.discounts - `0`
   * @property {Number} invoice.taxes - `0.12`
   * @property {Number} invoice.shipping - `4.0`
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
    requiresShipping: true,
    shipping: [{
      shopId,
      address: getAddress({ isShippingDefault: true }),
      itemIds: [itemIdOne, itemIdTwo]
    }], // Shipping Schema
    billing: [{
      _id: Random.id(),
      shopId,
      address: getAddress({ isBillingDefault: true }),
      paymentMethod: paymentMethod({
        method: "credit",
        processor: "Example",
        storedCard: "MasterCard 2346",
        paymentPackageId: getPkgData("example-paymentmethod") ? getPkgData("example-paymentmethod")._id : "uiwneiwknekwewe",
        paymentSettingsKey: "example-paymentmethod",
        mode: "authorize",
        status: "created",
        amount: 12.45
      }),
      invoice: {
        total: 12.45,
        subtotal: 12.45,
        discounts: 0,
        taxes: 0.12,
        shipping: 4.00
      }
    }],
    state: "new",
    createdAt: new Date(),
    updatedAt: new Date()
  });
}
