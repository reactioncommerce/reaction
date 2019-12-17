import { decodeShopOpaqueId, decodeAccountOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation/setUserPermissions
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver to replace user permissions. The replaces the groups on an account with the provided groups
 * which in effect replaces the permissions of an account. Permissions are applied to groups
 * @param {Object} _ - unused
 * @param {Object} input - an object of all mutation arguments that were sent by the client
 * @param {String} input.groups - The group the user is to be added to
 * @param {Object} context - an object containing the per-request state
 * @param {Object} context.userId - the userId of user to add to the given group
 * @param {Object} context.accountId - the userId of user to add to the given group
 * @returns {Object} - object
 */
export default async function setUserPermissions(_, { input }, context) {
  const { shopId, accountId, clientMutationId } = input;
  const decodedShopId = decodeShopOpaqueId(shopId);
  const decodedAccountId = decodeAccountOpaqueId(accountId);
  const transformedInput = { ...input, shopId: decodedShopId, accountId: decodedAccountId };
  const result = await context.mutations.setUserPermissions(context, transformedInput);
  return { account: result, clientMutationId };
}
