import { decodeAccountOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.updateAdminUIAccess
 * @summary resolver for the updateAdminUIAccess GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input An object of all mutation arguments that were sent by the client
 * @param {String} args.input.accountIds Account IDs to unassign the shop from
 * @param {String} args.input.accountIds Shop IDs to unassign from the account
 * @param {String} [args.input.clientMutationId] An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} an object containing the up to date account and the clientMutationId
 */
export default async function updateAdminUIAccess(parentResult, { input = {} }, context) {
  const {
    clientMutationId = null,
    accountIds: opaqueAccountIds,
    shopIds: opaqueShopIds
  } = input;

  const accountIds = opaqueAccountIds.map((opaqueAccountId) => decodeAccountOpaqueId(opaqueAccountId));
  const shopIds = opaqueShopIds.map((opaqueShopId) => decodeShopOpaqueId(opaqueShopId));

  const accounts = await context.mutations.updateAdminUIAccess(context, { accountIds, shopIds });

  return {
    accounts,
    clientMutationId
  };
}
