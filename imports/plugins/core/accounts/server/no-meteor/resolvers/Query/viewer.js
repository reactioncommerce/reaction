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
export default async function viewer(_, __, context, info) {
  if (!context.userId) return null;

  // Classic Meteor UI creates dummy accounts for "anonymous" user. We should ignore those.
  const user = await context.collections.users.findOne({ _id: context.userId });
  if (!user || !user.roles || !Array.isArray(user.roles[Object.keys(user.roles)[0]]) || user.roles[Object.keys(user.roles)[0]].indexOf("anonymous") !== -1) {
    return null;
  }

  return optimizeIdOnly(context.userId, info, context.queries.userAccount)(context, context.userId);
}
