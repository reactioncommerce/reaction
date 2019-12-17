import { decodeShopOpaqueId, decodeAccountOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation/addUserPermissions
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver to add user permissions
 * @param {Object} _ - unused
 * @param {Object} input - an object of all mutation arguments that were sent by the client
 * @param {String} input.groups - The group the user is to be added to
 * @param {String} input.accountId - the userId of user to add to the given group
 * @param {String} input.shopId - the shopId of the user to add to the given group
 * @param {String} input.clientMutationId - the client mutation Id  i.e. string identifying the mutation call,
 * which will be returned in the response payload
 * @param {Object} context - an object containing the per-request state
 * @returns {Object} - object
 */
export default async function addUserPermissions(_, { input }, context) {
  const { shopId, accountId, clientMutationId } = input;
  const decodedShopId = decodeShopOpaqueId(shopId);
  const decodedAccountId = decodeAccountOpaqueId(accountId);
  const transformedInput = { ...input, shopId: decodedShopId, accountId: decodedAccountId };
  const result = await context.mutations.addUserPermissions(context, transformedInput);
  return { account: result, clientMutationId };
}
