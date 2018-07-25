import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import getCart from "/imports/plugins/core/cart/both/util/getCart";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import addCartItems from "../no-meteor/mutations/addCartItems";

/**
 *  @method cart/addToCart
 *  @summary Add items to a user cart. When we add an item to the cart,
 *  we want to break all relationships with the existing item.
 *  We want to fix price, qty, etc into history.
 *  However, we could check reactively for price /qty etc, adjustments on the original and notify them.
 *  @memberof Cart/Methods
 *  @param {String} productId - productId to add to Cart
 *  @param {String} variantId - product variant _id
 *  @param {Number} [quantity] - Quantity to add to cart. Default is 1
 *  @param {Object} [additionalOptions] - object containing additional options and fields for cart item
 *  @return {Object} An object with the updated cart document (`cart`), `incorrectPriceFailures`, and
 *    `minOrderQuantityFailures`
 */
export default function addToCart(productId, variantId, quantity, additionalOptions) {
  check(productId, String);
  check(variantId, String);
  check(quantity, Match.Optional(Number));
  check(additionalOptions, Match.Optional(Object));

  const { cart } = getCart(null, { throwIfNotFound: true });

  const items = [{
    price: {
      currencyCode: cart.currencyCode
    },
    productConfiguration: {
      productId,
      productVariantId: variantId
    },
    quantity: quantity || 1
  }];

  if (additionalOptions && additionalOptions.metafields) {
    items[0].metafields = additionalOptions.metafields;
  }

  const context = Promise.await(getGraphQLContextInMeteorMethod(Meteor.userId()));
  const {
    cart: updatedCart,
    incorrectPriceFailures,
    minOrderQuantityFailures
  } = Promise.await(addCartItems(context, {
    cartId: cart._id,
    items
  }, { skipPriceCheck: true }));

  // Never send the hashed token to a client
  delete updatedCart.anonymousAccessToken;

  return {
    cart: updatedCart,
    incorrectPriceFailures,
    minOrderQuantityFailures
  };
}
