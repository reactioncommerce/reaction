import xformArrayToConnection from "@reactioncommerce/api-utils/graphql/xformArrayToConnection.js";

/**
 * @name Account/groups
 * @method
 * @memberof Accounts/GraphQL
 * @summary converts the `groups` prop on the provided account to a connection
 * @param {Object} account - result of the parent resolver, which is an Account object in GraphQL schema format
 * @param {ConnectionArgs} connectionArgs - an object of all arguments that were sent by the client
 * @param {Object} context App context
 * @returns {Promise<Object>} A connection object
 */
export default async function groups(account, connectionArgs, context) {
  const groupObjects = await context.queries.groupsByAccount(context, account);
  return xformArrayToConnection(connectionArgs, groupObjects);
}
