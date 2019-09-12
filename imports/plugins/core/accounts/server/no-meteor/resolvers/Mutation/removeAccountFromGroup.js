import { decodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import { decodeGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/group";

/**
 * @name Mutation/removeAccountFromGroup
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver for the removeAccountFromGroup GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.accountId - The account ID
 * @param {String} args.input.groupId - The group ID
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Object} RemoveAccountFromGroupPayload
 */
export default async function removeAccountFromGroup(_, { input }, context) {
  const { accountId, groupId, clientMutationId = null } = input;
  const decodedAccountId = decodeAccountOpaqueId(accountId);
  const decodedGroupId = decodeGroupOpaqueId(groupId);

  const group = await context.mutations.removeAccountFromGroup(context, {
    accountId: decodedAccountId,
    groupId: decodedGroupId
  });

  return {
    group,
    clientMutationId
  };
}
