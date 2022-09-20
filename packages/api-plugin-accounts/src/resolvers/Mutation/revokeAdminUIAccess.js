import { decodeAccountOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.revokeAdminUIAccess
 * @summary resolver for the revokeAdminUIAccess GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input An object of all mutation arguments that were sent by the client
 * @param {String} args.input.accountId Account ID to unassign the shop from
 * @param {String} args.input.shopId Shop ID to unassign from the account
 * @param {String} [args.input.clientMutationId] An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} an object containing the up to date account and the clientMutationId
 */
export default async function revokeAdminUIAccess(parentResult, { input = {} }, context) {
  const {
    clientMutationId = null,
    accountId: opaqueAccountId,
    shopId: opaqueShopId
  } = input;

  const accountId = decodeAccountOpaqueId(opaqueAccountId);
  const shopId = decodeShopOpaqueId(opaqueShopId);

  const account = await context.mutations.revokeAdminUIAccess(context, { accountId, shopId });

  return {
    account,
    clientMutationId
  };
}
