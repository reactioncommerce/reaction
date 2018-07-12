/**
 * @name "Query.accountCartByAccountId"
 * @method
 * @memberof Cart/GraphQL
 * @summary resolver for the accountCartByAccountId GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} TODO
 */
export default async function accountCartByAccountId(parentResult, { /* TODO */ }, context) {
  // TODO: decode incoming IDs here
  return context.queries.cart.accountCartByAccountId(context);
}
