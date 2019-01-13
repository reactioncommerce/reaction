import faker from "faker";
import _ from "lodash";
import Random from "@reactioncommerce/random";
import { Factory } from "meteor/dburles:factory";
import rawCollections from "/imports/collections/rawCollections";
import publishProductToCatalog from "/imports/plugins/core/catalog/server/no-meteor/utils/publishProductToCatalog";
import { Cart, Products } from "/lib/collections";
import { getShop } from "./shops";
import { getAddress } from "./accounts";
import { addProduct } from "./products";

/**
 * @method getCartItem
 * @memberof Fixtures
 * @param {Object} [options] - Options object (optional)
 * @param {string} [options._id] - id of CartItem
 * @param {string} [options.productId] - _id of product that item came from
 * @param {string} [options.shopId] - _id of shop that item came from
 * @param {number} [options.quantity] - quantity of item in CartItem
 * @param {Object} [options.variants] - _single_ variant object. ¯\_(ツ)_/¯ why called variants
 *
 * @returns {Object} - randomly generated cartItem/orderItem data object
 */
export function getCartItem(options = {}) {
  const product = addProduct();
  Promise.await(publishProductToCatalog(product, {
    appEvents: {
      emit() {},
      on() {}
    },
    collections: rawCollections,
    getFunctionsOfType: () => []
  }));
  const variant = Products.findOne({ ancestors: [product._id] });
  const childVariants = Products.find({
    ancestors: [
      product._id, variant._id
    ]
  }).fetch();
  const selectedOption = Random.choice(childVariants);
  const quantity = _.random(1, selectedOption.inventoryInStock);
  const defaults = {
    _id: Random.id(),
    addedAt: new Date(),
    createdAt: new Date(),
    isTaxable: false,
    optionTitle: selectedOption.optionTitle,
    price: {
      amount: selectedOption.price,
      currencyCode: "USD"
    },
    priceWhenAdded: {
      amount: selectedOption.price,
      currencyCode: "USD"
    },
    productId: product._id,
    productSlug: product.handle,
    productType: product.type,
    quantity,
    shopId: options.shopId || getShop()._id,
    subtotal: {
      amount: selectedOption.price * quantity,
      currencyCode: "USD"
    },
    title: product.title,
    updatedAt: new Date(),
    variantId: selectedOption._id,
    variantTitle: selectedOption.title
  };
  return _.defaults(options, defaults);
}

/**
 * @method getSingleCartItem
 * @memberof Fixtures
 * @param {Object} [options] - Options object (optional)
 * @param {string} [options._id] - id of CartItem
 * @param {string} [options.productId] - _id of product that item came from
 * @param {string} [options.shopId] - _id of shop that item came from
 * @returns {Object} - randomly generated cartItem/orderItem data object with only one cart item
 */
function getSingleCartItem(options = {}) {
  const cartItem = getCartItem(options);
  const quantity = options.cartQuantity || 1;
  cartItem.quantity = quantity;
  return cartItem;
}

/**
 * @method createCart
 * @memberof Fixtures
 * @param  {String} productId ID of Product
 * @param  {String} variantId ID of Product Variant
 * @return {Object}           Inserted cart object
 */
export function createCart(productId, variantId) {
  const product = Products.findOne(productId);
  const variant = Products.findOne(variantId);
  const user = Factory.create("user");
  const account = Factory.create("account", { userId: user._id });
  const quantity = _.random(1, variant.inventoryInStock);
  const cartItem = {
    _id: Random.id(),
    addedAt: new Date(),
    createdAt: new Date(),
    isTaxable: false,
    optionTitle: variant.optionTitle,
    price: {
      amount: variant.price,
      currencyCode: "USD"
    },
    priceWhenAdded: {
      amount: variant.price,
      currencyCode: "USD"
    },
    productId: product._id,
    productSlug: product.handle,
    productType: product.type,
    quantity,
    shopId: getShop()._id,
    subtotal: {
      amount: variant.price * quantity,
      currencyCode: "USD"
    },
    title: product.title,
    updatedAt: new Date(),
    variantId: variant._id,
    variantTitle: variant.title
  };

  const cart = {
    shopId: getShop()._id,
    accountId: account._id,
    email: faker.internet.email(),
    items: [cartItem],
    currencyCode: "USD",
    shipping: [
      {
        _id: Random.id(),
        shopId: getShop()._id,
        address: getAddress()
      }
    ],
    workflow: {
      status: "checkoutPayment",
      workflow: [
        "checkoutAddressBook",
        "coreCheckoutShipping",
        "checkoutReview",
        "checkoutPayment"
      ]
    },
    createdAt: faker.date.past(),
    updatedAt: new Date()
  };
  const newCartId = Cart.insert(cart);
  const insertedCart = Cart.findOne({ _id: newCartId });
  return insertedCart;
}

export default function () {
  /**
   * @name Cart
   * @memberof Fixtures
   * @summary Define cart Factory
   * @example const cart = Factory.create("cartMultiItems");
   * @property {string} shopId id - `getShop().id`
   * @property {string} accountId id - `Factory.get("account")`
   * @property {string} email - `faker.internet.email()`
   * @property {Array} items - `[getCartItem(), getCartItem()]`
   * @property {Array} shipping - `[
     {
       _id: Random.id(),
       shopId: getShop()._id,
       address: addressForOrder
     }
   ]`
   * @property {Object} workflow - `{
     status: "checkoutPayment",
     workflow: [
       "checkoutAddressBook",
       "coreCheckoutShipping",
       "checkoutReview",
       "checkoutPayment"
     ]
   }`
   * @property {Date} createdAt - `faker.date.past()`
   * @property {Date} updatedAt - `new Date()`
   * @description Types of Cart Factories:
   * - `cart`: A cart with a user and two items
   * - `cartToOrder`: A cart with shipping, billing info and at the Checkout workflow state
   * - `anonymousCart`: An empty cart with an anonymous user
   * - `cartOne`: A cart with one item
   * - `cartTwo`: A cart with one item with quantity 2
   * - `cartMultiItems`: A cart with two items, 1 each
   * - `cartMultiShop`: A cart with two items, from different shops
   * - `cartNoItems`: A cart with a user and no items
   */
  const cartNoItems = {
    shopId: getShop()._id,
    accountId: Factory.get("account", { userId: Factory.get("user") }),
    currencyCode: "USD",
    email: faker.internet.email(),
    items: [],
    shipping: [],
    workflow: {
      status: "new",
      workflow: []
    },
    createdAt: faker.date.past(),
    updatedAt: new Date()
  };

  const cart = {
    shopId: getShop()._id,
    accountId: Factory.get("account"),
    currencyCode: "USD",
    email: faker.internet.email(),
    items: [
      getCartItem(),
      getCartItem()
    ],
    shipping: [],
    workflow: {
      status: "new",
      workflow: []
    },
    createdAt: faker.date.past(),
    updatedAt: new Date()
  };

  const cartOne = {
    items: [
      getSingleCartItem()
    ]
  };

  const cartTwo = {
    items: [
      getSingleCartItem({ cartQuantity: 2 })
    ]
  };

  const cartMultiItems = {
    items: [getSingleCartItem(), getSingleCartItem()]
  };

  const cartMultiShopItems = {
    items: [getSingleCartItem(), getSingleCartItem({ shopId: Random.id() })]
  };

  const addressForOrder = getAddress();
  const cartToOrder = {
    shopId: getShop()._id,
    shipping: [
      {
        _id: Random.id(),
        shopId: getShop()._id,
        address: addressForOrder,
        payment: {
          _id: Random.id(),
          shopId: getShop()._id,
          address: addressForOrder
        }
      }
    ],
    workflow: {
      status: "checkoutPayment",
      workflow: [
        "checkoutAddressBook",
        "coreCheckoutShipping",
        "checkoutReview",
        "checkoutPayment"
      ]
    }
  };

  const anonymousCart = {
    accountId: Factory.get("account", { userId: Factory.get("anonymous") })
  };

  Factory.define("cart", Cart, Object.assign({}, cart));
  Factory.define("anonymousCart", Cart, Object.assign({}, cart, anonymousCart));
  Factory.define("cartOne", Cart, Object.assign({}, cart, cartToOrder, cartOne));
  Factory.define("cartTwo", Cart, Object.assign({}, cart, cartToOrder, cartTwo));
  Factory.define("cartMultiItems", Cart, Object.assign({}, cart, cartToOrder, cartMultiItems));
  Factory.define("cartMultiShop", Cart, Object.assign({}, cart, cartToOrder, cartMultiShopItems));
  Factory.define("cartNoItems", Cart, Object.assign({}, cart, cartToOrder, cartNoItems));
}
