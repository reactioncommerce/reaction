import { decodeShopOpaqueId, decodeAccountOpaqueId } from "../../xforms/id.js";
/**
 * @name Mutation/removeUserPermissions
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver to remove user permissions
 * @param {Object} _ - unused
 * @param {Object} input - an object of all mutation arguments that were sent by the client
 * @param {String} input.groups - The group the user is to be added to
 * @param {Object} input.accountId - the accountId of user to remove from the given group
 * @param {Object} context - an object containing the per-request state
 * @returns {Object} - object
 */
export default async function removeUserPermissions(_, { input }, context) {
  const { shopId, clientMutationId, accountId } = input;
  const decodedShopId = decodeShopOpaqueId(shopId);
  const decodedAccountId = decodeAccountOpaqueId(accountId);
  const transformedInput = { ...input, shopId: decodedShopId, accountId: decodedAccountId };
  const result = await context.mutations.removeUserPermissions(context, transformedInput);
  return { ...result, clientMutationId };
}
