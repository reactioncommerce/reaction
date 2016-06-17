import faker from "faker";
import { Factory } from "meteor/dburles:factory";
import { Cart, Products } from "/lib/collections";
import "./shops";
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
  const childVariants = Products.find({ ancestors: [
    product._id, variant._id
  ] }).fetch();
  const selectedOption = Random.choice(childVariants);
  const defaults = {
    _id: Random.id(),
    productId: product._id,
    shopId: getShop()._id,
    quantity: _.random(1, selectedOption.inventoryQuantity),
    variants: selectedOption,
    title: "cart title"
  };
  return _.defaults(options, defaults);
}


export default function () {
  /**
   * Cart Factory
   * @summary define cart Factory
   */

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
  const addressForOrder = getAddress();
  const cartToOrder = {
    shopId: getShop()._id,
    shipping: [
      {
        _id: Random.id(),
        address: addressForOrder
      }
    ],
    billing: [
      {
        _id: Random.id(),
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
}
