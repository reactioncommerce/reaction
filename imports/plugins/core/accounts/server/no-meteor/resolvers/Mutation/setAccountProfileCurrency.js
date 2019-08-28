import { decodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";

/**
 * @name Mutation/setAccountProfileCurrency
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver for the setAccountProfileCurrency GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} [args.input.accountId] - The account ID, which defaults to the viewer account
 * @param {String} args.input.currencyCode - The currencyCode to add to user profile
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Object} setAccountProfileCurrency
 */
export default async function setAccountProfileCurrency(_, { input }, context) {
  const { accountId, currencyCode, clientMutationId = null } = input;
  const decodedAccountId = decodeAccountOpaqueId(accountId);

  const updatedAccount = await context.mutations.setAccountProfileCurrency(context, {
    currencyCode,
    accountId: decodedAccountId
  });

  return {
    account: updatedAccount,
    clientMutationId
  };
}
