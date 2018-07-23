import { Meteor } from "meteor/meteor";

/**
 * @name accountCartByAccountId
 * @method
 * @memberof Cart/NoMeteorQueries
 * @summary Query the Cart collection for a cart with the provided accountId and shopId
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} [params.accountId] - An account ID
 * @param {String} [params.shopId] - A shop ID
 * @return {Promise<Object>|undefined} A Cart document, if one is found
 */
export default async function accountCartByAccountId(context, { accountId, shopId } = {}) {
  const { accountId: contextAccountId, collections, userHasPermission } = context;
  const { Cart } = collections;

  if (accountId !== contextAccountId && !userHasPermission(["owner", "admin"], shopId)) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  if (!accountId) {
    throw new Meteor.Error("invalid-param", "You must provide accountId");
  }
  if (!shopId) {
    throw new Meteor.Error("invalid-param", "You must provide shopId");
  }

  return Cart.findOne({ accountId, shopId });
}
