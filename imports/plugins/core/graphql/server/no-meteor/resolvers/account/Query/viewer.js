import { optimizeIdOnly } from "@reactioncommerce/reaction-graphql-utils";

/**
 * @name "Query.viewer"
 * @method
 * @memberof Accounts/GraphQL
 * @summary query the Accounts collection and return user account data for the current user
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {Object} context - an object containing the per-request state
 * @return {Object} user account object
 */
export default function viewer(_, __, context, info) {
  if (!context.userId) return null;

  return optimizeIdOnly(context.userId, info, context.queries.accounts.userAccount)(context, context.userId);
}
