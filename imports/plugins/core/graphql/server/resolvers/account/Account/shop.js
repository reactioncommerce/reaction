/**
 * @name shop
 * @method
 * @summary gets the shop object for the provided account
 * @param {Object} account - result of the parent resolver, which is an Account object in GraphQL schema format
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} The shop having ID account.shopId, in GraphQL schema format
 */
export default async function shop(account, _, context) {
  const { shopId } = account;
  if (!shopId) return null;

  return context.queries.shopById(context, shopId);
}
