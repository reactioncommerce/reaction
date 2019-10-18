import { decodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";

/**
 * @name Mutation/updateAccountName
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver for the updateAccountName GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} [args.input.accountId] - The account ID, which defaults to the viewer account
 * @param {String} args.input.name - The name to update on the viewer
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Object} updateAccountName
 */
export default async function updateAccountName(_, { input }, context) {
  const { accountId, name, clientMutationId = null } = input;
  const decodedAccountId = decodeAccountOpaqueId(accountId);

  const updatedAccount = await context.mutations.updateAccountName(context, {
    name,
    accountId: decodedAccountId
  });

  return {
    account: updatedAccount,
    clientMutationId
  };
}
