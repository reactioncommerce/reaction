import { decodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";

/**
 * @name addAccountEmailRecord
 * @method
 * @summary resolver for the addAccountEmailRecord GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} [args.input.accoundId] - The account ID, which defaults to the viewer account
 * @param {AddressInput} args.input.email - The email address to add
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @return {Object} AddAccountEmailRecordPayload
 */
export default function addAccountEmailRecord(_, { input }, context) {
  const { accountId, email, clientMutationId = null } = input;
  const dbAccountId = decodeAccountOpaqueId(accountId);
  const updatedEmail = context.methods["accounts/updateEmailAddress"](context, [email, dbAccountId]);
  console.log("updatedEmail", updatedEmail);

  return {
    ...updatedEmail,
    clientMutationId
  };
}
