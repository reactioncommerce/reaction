import { decodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";

/**
 * @name Mutation.setAccountProfileLanguage
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver for the setAccountProfileLanguage GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} [args.input.accoundId] - The account ID, which defaults to the viewer account
 * @param {String} args.input.language- The languageto add to user profile
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @return {Promise<Object>} setAccountProfileLanguage
 */
export default async function setAccountProfileLanguage(_, { input }, context) {
  const { accountId, language, clientMutationId = null } = input;
  const decodedAccountId = decodeAccountOpaqueId(accountId);

  const updatedAccount = await context.mutations.setAccountProfileLanguage(context, {
    language,
    accountId: decodedAccountId
  });

  return {
    account: updatedAccount,
    clientMutationId
  };
}
