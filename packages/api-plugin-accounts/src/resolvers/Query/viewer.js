import optimizeIdOnly from "@reactioncommerce/api-utils/graphql/optimizeIdOnly.js";

/**
 * @name Query/viewer
 * @method
 * @memberof Accounts/GraphQL
 * @summary query the Accounts collection and return user account data for the current user
 * @param {Object} _ - unused
 * @param {Object} __ - unused
 * @param {Object} context - an object containing the per-request state
 * @param {Object} info - an object of all arguments that were sent by the client
 * @returns {Object} user account object
 */
export default async function viewer(_, __, context, info) {
  if (!context.accountId) return null;

  return optimizeIdOnly(context.accountId, info, context.queries.userAccount)(context, context.accountId);
}
