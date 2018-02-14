import faker from "faker";
import _ from "lodash";
import { Factory } from "meteor/dburles:factory";
import { Random } from "meteor/random";
import { Cart, Products } from "/lib/collections";
import { getShop } from "./shops";
import { getAddress } from "./accounts";
import { addProduct } from "./products";

/**
 *
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
  const variant = Products.findOne({ ancestors: [product._id] });
  const childVariants = Products.find({
    ancestors: [
      product._id, variant._id
    ]
  }).fetch();
  const selectedOption = Random.choice(childVariants);
  const defaults = {
    _id: Random.id(),
    productId: product._id,
    shopId: options.shopId || getShop()._id,
    quantity: _.random(1, selectedOption.inventoryQuantity),
    product,
    variants: selectedOption,
    title: product.title
  };
  return _.defaults(options, defaults);
}

function getSingleCartItem(options = {}) {
  const cartItem = getCartItem(options);
  const quantity = options.cartQuantity || 1;
  cartItem.quantity = quantity;
  return cartItem;
}

export function createCart(productId, variantId) {
  const product = Products.findOne(productId);
  const variant = Products.findOne(variantId);
  const user = Factory.create("user");
  const cartItem = {
    _id: Random.id(),
    productId: product._id,
    shopId: getShop()._id,
    quantity: 1,
    product,
    variants: variant,
    title: product.title
  };

  const cart = {
    shopId: getShop()._id,
    userId: user._id,
    sessionId: Random.id(),
    email: faker.internet.email(),
    items: [cartItem],
    shipping: [
      {
        _id: Random.id(),
        shopId: getShop()._id,
        address: getAddress()
      }
    ],
    billing: [
      {
        _id: Random.id(),
        shopId: getShop()._id,
        address: getAddress()
      }
    ],
    workflow: {
      status: "checkoutPayment",
      workflow: [
        "checkoutLogin",
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
  const insertedCart = Cart.findOne(newCartId);
  return insertedCart;
}


export default function () {
  /**
   * Cart Factory
   * @summary define cart Factory
   */

  const cartNoItems = {
    shopId: getShop()._id,
    userId: Factory.get("user"),
    sessionId: Random.id(),
    email: faker.internet.email(),
    items: [],
    shipping: [],
    billing: [],
    workflow: {
      status: "new",
      workflow: []
    },
    createdAt: faker.date.past(),
    updatedAt: new Date()
  };

  const cart = {
    shopId: getShop()._id,
    userId: Factory.get("user"),
    sessionId: Random.id(),
    email: faker.internet.email(),
    items: [
      getCartItem(),
      getCartItem()
    ],
    shipping: [],
    billing: [],
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
        address: addressForOrder
      }
    ],
    billing: [
      {
        _id: Random.id(),
        shopId: getShop()._id,
        address: addressForOrder
      }
    ],
    workflow: {
      status: "checkoutPayment",
      workflow: [
        "checkoutLogin",
        "checkoutAddressBook",
        "coreCheckoutShipping",
        "checkoutReview",
        "checkoutPayment"
      ]
    }
  };

  const anonymousCart = {
    userId: Factory.get("anonymous")
  };

  Factory.define("cart", Cart, Object.assign({}, cart));
  Factory.define("cartToOrder", Cart, Object.assign({}, cart, cartToOrder));
  Factory.define("anonymousCart", Cart, Object.assign({}, cart, anonymousCart));
  Factory.define("cartOne", Cart, Object.assign({}, cart, cartToOrder, cartOne));
  Factory.define("cartTwo", Cart, Object.assign({}, cart, cartToOrder, cartTwo));
  Factory.define("cartMultiItems", Cart, Object.assign({}, cart, cartToOrder, cartMultiItems));
  Factory.define("cartMultiShop", Cart, Object.assign({}, cart, cartToOrder, cartMultiShopItems));
  Factory.define("cartNoItems", Cart, Object.assign({}, cart, cartToOrder, cartNoItems));
}
