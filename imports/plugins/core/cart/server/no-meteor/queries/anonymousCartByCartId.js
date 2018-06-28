import { Meteor } from "meteor/meteor";

/**
 * @name anoynymousCartbyCartId
 * @method
 * @memberof Cart/NoMeteorQueries
 * @summary Query the Cart collection for a cart with the provided cartId
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} [params.cartId] - Cart id to include
 * @param {String} [params.token] - Anonymous cart token
 * @return {Object} - An anonymous cart.
 */
export default async function anonymousCartByCartId(context, { cartId, token } = {}) {
  const { collections } = context;
  const { Cart } = collections;

  if (!cartId) {
    throw new Meteor.Error("invalid-param", "You must provide a cartId");
  }

  // TODO: Use token

  const query = {
    _id: cartId
  };

  return Cart.findOne(query);
}
