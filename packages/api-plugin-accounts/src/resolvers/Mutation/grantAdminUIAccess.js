import { decodeAccountOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.grantAdminUIAccess
 * @summary resolver for the grantAdminUIAccess GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input An object of all mutation arguments that were sent by the client
 * @param {String} args.input.accountId Account ID to assign the shop to
 * @param {String} args.input.shopId Shop ID to assign to the account
 * @param {String} [args.input.clientMutationId] An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Boolean>} an object containing the up to date account and the clientMutationId
 */
export default async function grantAdminUIAccess(parentResult, { input = {} }, context) {
  const {
    clientMutationId = null,
    accountId: opaqueAccountId,
    shopId: opaqueShopId
  } = input;

  const accountId = decodeAccountOpaqueId(opaqueAccountId);
  const shopId = decodeShopOpaqueId(opaqueShopId);

  const account = await context.mutations.grantAdminUIAccess(context, { accountId, shopId });

  return {
    account,
    clientMutationId
  };
}
