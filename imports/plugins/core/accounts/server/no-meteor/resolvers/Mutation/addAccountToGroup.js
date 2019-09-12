import { decodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import { decodeGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/group";

/**
 * @name Mutation/addAccountToGroup
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver for the addAccountToGroup GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.accountId - The account ID
 * @param {String} args.input.groupId - The group ID
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Object} AddAccountToGroupPayload
 */
export default async function addAccountToGroup(parentResult, { input }, context) {
  const { accountId: opaqueAccountId, groupId: opaqueGroupId, clientMutationId = null } = input;

  const accountId = decodeAccountOpaqueId(opaqueAccountId);
  const groupId = decodeGroupOpaqueId(opaqueGroupId);

  const group = await context.mutations.addAccountToGroup(context, {
    accountId,
    groupId
  });

  return {
    group,
    clientMutationId
  };
}
