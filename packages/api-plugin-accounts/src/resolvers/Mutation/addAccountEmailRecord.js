import { decodeAccountOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation/addAccountEmailRecord
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver for the addAccountEmailRecord GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.accountId - The account ID
 * @param {String} args.input.email - The email to add
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Object} addAccountEmailRecordPayload
 */
export default async function addAccountEmailRecord(_, { input }, context) {
  const { accountId, email, clientMutationId = null } = input;
  const decodedAccountId = decodeAccountOpaqueId(accountId);

  const updatedAccount = await context.mutations.addAccountEmailRecord(context, {
    accountId: decodedAccountId,
    email
  });

  return {
    account: updatedAccount,
    clientMutationId
  };
}
