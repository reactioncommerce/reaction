/**
 * @name Account/groups
 * @method
 * @memberof Accounts/GraphQL
 * @summary converts the `groups` prop on the provided account to a connection
 * @param {Object} account - result of the parent resolver, which is an Account object in GraphQL schema format
 * @param {ConnectionArgs} args - an object of all arguments that were sent by the client
 * @param {Object} context App context
 * @returns {Promise<Object>} A connection object
 */
export default async function adminUIShops(account, args, context) {
  const shopCursor = await context.queries.shops(context, { shopIds: account.adminUIShopIds });

  return shopCursor.toArray();
}
