import { decodeAccountOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation.updateAccount
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver for the updateAccount GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} [args.input.accountId] - The account ID, which defaults to the viewer account
 * @param {String} [args.input.currencyCode] - currency code
 * @param {String} [args.input.firstName] - First name
 * @param {String} [args.input.language] - Language
 * @param {String} [args.input.lastName] - Last name
 * @param {String} [args.input.name] - Name
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} updateAccount
 */
export default async function updateAccount(_, { input }, context) {
  const { accountId, clientMutationId = null, ...otherInput } = input;
  const decodedAccountId = decodeAccountOpaqueId(accountId);

  const updatedAccount = await context.mutations.updateAccount(context, {
    ...otherInput,
    accountId: decodedAccountId
  });

  return {
    account: updatedAccount,
    clientMutationId
  };
}
