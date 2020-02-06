import _ from "lodash";

/**
 * @name groupsByAccount
 * @method
 * @memberof Accounts/NoMeteorQueries
 * @summary Map the account group IDs array to group documents, omitting any the current user
 *   does not have permission for
 * @param {Object} context - an object containing the per-request state
 * @param {Object} account - Account document
 * @returns {Object[]} Array of group objects
 */
export default async function groupsByAccount(context, account) {
  const { collections: { Groups } } = context;

  if (!Array.isArray(account.groups)) return [];

  const groups = await Groups.find({
    _id: { $in: account.groups }
  }).toArray();

  const shopIds = _.uniq(groups.map((group) => group.shopId));

  const allowedShopIds = [];
  await Promise.all(shopIds.map(async (shopId) => {
    const allowed = await context.userHasPermission("reaction:legacy:groups", "read", { shopId });
    if (allowed) allowedShopIds.push(shopId);
  }));

  return groups.filter((group) => allowedShopIds.includes(group.shopId));
}
