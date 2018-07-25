import { Meteor } from "meteor/meteor";
import hashLoginToken from "/imports/plugins/core/accounts/server/no-meteor/util/hashLoginToken";

/**
 * @name anonymousCartByCartId
 * @method
 * @memberof Cart/NoMeteorQueries
 * @summary Query the Cart collection for a cart with the provided cartId
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} [params.cartId] - Cart id to include
 * @param {String} [params.token] - Anonymous cart token
 * @return {Promise<Object>|undefined} - A Cart document, if one is found
 */
export default async function anonymousCartByCartId(context, { cartId, token } = {}) {
  const { collections } = context;
  const { Cart } = collections;

  if (!cartId) {
    throw new Meteor.Error("invalid-param", "You must provide a cartId");
  }

  return Cart.findOne({
    _id: cartId,
    anonymousAccessToken: hashLoginToken(token)
  });
}
