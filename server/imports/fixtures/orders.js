import faker from "faker";
import _ from "lodash";
import { Random } from "meteor/random";
import { Factory } from "meteor/dburles:factory";
import { Orders, Products } from "/lib/collections";
import { getShop } from "./shops";
import { getUser } from "./users";
import { getPkgData } from "./packages";
import { getAddress } from "./accounts";
import { addProduct } from "./products";

/**
 * order factory methods
 * @type {Object}
 * @summary reaction specific faker functions for providing fake order data for testing
 */

export function randomProcessor() {
  return _.sample(["Stripe", "Paypal", "Braintree"]);
}

const itemIdOne = Random.id();
const itemIdTwo = Random.id();

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

export function randomMode() {
  return _.sample(["authorize", "capture", "refund", "void"]);
}

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

export function getUserId() {
  return getUser()._id;
}

export function getShopId() {
  return getShop()._id;
}


/**
 * order factory
 * @summary Factory for generating reaction orders
 */

export default function () {
  const shopId = getShopId();
  Factory.define("order", Orders, {
    // Schemas.OrderItems
    additionalField: faker.lorem.sentence(),
    status: faker.lorem.sentence(3),
    history: [],
    documents: [],

    // Schemas.Order
    cartId: Random.id(),
    notes: [],

    // Schemas.Cart
    shopId,
    userId: getUserId(),
    sessionId: "Session",
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
      items: [
        {
          _id: itemIdOne,
          productId: Random.id(),
          quantity: 1,
          shopId,
          variantId: Random.id(),
          packed: false
        },
        {
          _id: itemIdTwo,
          productId: Random.id(),
          quantity: 1,
          shopId,
          variantId: Random.id(),
          packed: false
        }
      ]
    }], // Shipping Schema
    billing: [{
      _id: Random.id(),
      shopId,
      address: getAddress({ isBillingDefault: true }),
      paymentMethod: paymentMethod({
        method: "credit",
        processor: "Example",
        storedCard: "Mastercard 2346",
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

  /**
   * authorizedApprovedPaypalOrder Factory
   * @summary defines order factory which generates an authorized, apporved, paypal order.
   */
  Factory.define(
    "authorizedApprovedPaypalOrder", Orders,
    Factory.extend("order", {
      billing: [{
        _id: Random.id(),
        shopId: getShopId(),
        address: getAddress({ isBillingDefault: true }),
        paymentMethod: paymentMethod({
          processor: "Paypal",
          mode: "authorize",
          status: "approved"
        })
      }]
    })
  );
}
