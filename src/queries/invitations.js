/**
 * @name invitations
 * @method
 * @memberof Accounts/NoMeteorQueries
 * @summary Returns invitations optionally filtered by shop IDs
 * @param {Object} context - an object containing the per-request state
 * @param {String} input - input for query
 * @param {String} [input.shopIds] - Array of shop IDs to limit the results
 * @returns {Promise} Mongo cursor
 */
export default async function invitations(context, { shopIds }) {
  const { collections } = context;
  const { AccountInvites } = collections;

  if (Array.isArray(shopIds) && shopIds.length > 0) {
    await Promise.all(shopIds.map((shopId) => context.validatePermissions("reaction:legacy:groups", "manage:accounts", { shopId })));

    return AccountInvites.find({
      shopId: {
        $in: shopIds
      }
    });
  }

  await context.validatePermissions("reaction:legacy:invitations", "read");

  return AccountInvites.find();
}
