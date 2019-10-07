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
  if (!context.userId) return null;

  // Classic Meteor UI creates dummy accounts for "anonymous" user. We should ignore those.
  const user = await context.collections.users.findOne({ _id: context.userId });
  if (!user || !user.roles || !Array.isArray(user.roles[Object.keys(user.roles)[0]]) || user.roles[Object.keys(user.roles)[0]].includes("anonymous")) {
    return null;
  }

  return optimizeIdOnly(context.userId, info, context.queries.userAccount)(context, context.userId);
}
