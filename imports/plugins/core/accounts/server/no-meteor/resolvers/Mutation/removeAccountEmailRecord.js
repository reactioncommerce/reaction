import { decodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";

/**
 * @name Mutation/removeAccountEmailRecord
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver for the removeAccountEmailRecord GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.accountId - The account ID
 * @param {String} args.input.email - The email to remove
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Object} removeAccountEmailRecordPayload
 */
export default async function removeAccountEmailRecord(_, { input }, context) {
  const { accountId, email, clientMutationId = null } = input;
  const decodedAccountId = decodeAccountOpaqueId(accountId);

  const updatedAccount = await context.mutations.removeAccountEmailRecord(context, {
    accountId: decodedAccountId,
    email
  });

  return {
    account: updatedAccount,
    clientMutationId
  };
}
