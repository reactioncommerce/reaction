import { decodeAccountOpaqueId, decodeGroupOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation/removeAccountFromGroup
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver for the removeAccountFromGroup GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.accountId - The account ID
 * @param {String} args.input.groupId - The group ID
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Object} removeAccountFromGroupPayload
 */
export default async function removeAccountFromGroup(parentResult, { input }, context) {
  const { accountId: opaqueAccountId, groupId: opaqueGroupId, clientMutationId = null } = input;

  const accountId = decodeAccountOpaqueId(opaqueAccountId);
  const groupId = decodeGroupOpaqueId(opaqueGroupId);

  const group = await context.mutations.removeAccountFromGroup(context, {
    accountId,
    groupId
  });

  return {
    group,
    clientMutationId
  };
}
