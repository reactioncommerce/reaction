import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name accountCartByAccountId
 * @method
 * @memberof Cart/NoMeteorQueries
 * @summary Query the Cart collection for a cart with the provided accountId and shopId
 * @param {Object} context -  an object containing the per-request state
 * @param {Object} params - request parameters
 * @param {String} [params.accountId] - An account ID
 * @param {String} [params.shopId] - A shop ID
 * @returns {Promise<Object>|undefined} A Cart document, if one is found
 */
export default async function accountCartByAccountId(context, { accountId, shopId } = {}) {
  const { collections } = context;
  const { Cart } = collections;

  await context.validatePermissions(`reaction:legacy:accounts:${accountId._id}`, "read", { shopId, owner: accountId });

  if (!accountId) {
    throw new ReactionError("invalid-param", "You must provide accountId");
  }
  if (!shopId) {
    throw new ReactionError("invalid-param", "You must provide shopId");
  }

  return Cart.findOne({ accountId, shopId });
}
