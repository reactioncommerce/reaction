import { decodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import { decodeGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/group";

/**
 * @name "Mutation.addAccountToGroup"
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver for the addAccountToGroup GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.accoundId - The account ID
 * @param {String} args.input.groupId - The group ID
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @return {Object} AddAccountToGroupPayload
 */
export default function addAccountToGroup(_, { input }, context) {
  const { accountId, groupId, clientMutationId = null } = input;
  const dbAccountId = decodeAccountOpaqueId(accountId);
  const dbGroupId = decodeGroupOpaqueId(groupId);
  const group = context.methods["group/addUser"](context, [dbAccountId, dbGroupId]);
  return {
    group,
    clientMutationId
  };
}
