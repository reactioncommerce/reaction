import ReactionError from "@reactioncommerce/reaction-error";
import hashLoginToken from "/imports/node-app/core/util/hashLoginToken";

/**
 * @name orderByReferenceId
 * @method
 * @memberof Order/NoMeteorQueries
 * @summary Query the Orders collection for an order with the provided order referenceId
 * @param {Object} context - an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} params.orderReferenceId - Order reference ID
 * @param {String} params.shopId - Shop ID for the shop that owns the order
 * @param {String} [params.token] - Anonymous order token
 * @return {Promise<Object>|undefined} - An Order document, if one is found
 */
export default async function orderByReferenceId(context, { orderReferenceId, shopId, token } = {}) {
  const { accountId: contextAccountId, collections, userHasPermission } = context;
  const { Orders } = collections;

  if (!orderReferenceId || !shopId) {
    throw new ReactionError("invalid-param", "You must provide orderReferenceId and shopId arguments");
  }

  let accountId;
  let anonymousAccessToken;
  if (token) {
    accountId = null;
    anonymousAccessToken = hashLoginToken(token);
  } else {
    // Unless you are an admin with orders permission, you are limited to seeing it if you placed it
    if (!userHasPermission(["orders"], shopId)) {
      if (!contextAccountId) {
        throw new ReactionError("access-denied", "Access Denied");
      }
      accountId = contextAccountId;
    }
    anonymousAccessToken = null;
  }

  return Orders.findOne({
    accountId,
    anonymousAccessToken,
    referenceId: orderReferenceId,
    shopId
  });
}
