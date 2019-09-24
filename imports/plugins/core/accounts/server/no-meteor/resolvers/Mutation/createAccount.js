import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name Mutation/createAccount
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver for the createAccount GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {String} args.input.additionals - various account related data
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {String} args.input.shopId - shop to create account for
 * @param {String} [args.input.tokenObj] - token information for account verification
 * @param {String} args.input.user - Meteor user to create account based on
 * @param {Object} context - an object containing the per-request state
 * @returns {Object} createAccountPayload
 */
export default async function createAccount(parentResult, { input }, context) {
  const { additionals, shopId: opaqueShopId, tokenObj, user, clientMutationId = null } = input;

  const shopId = decodeShopOpaqueId(opaqueShopId);

  const account = await context.mutations.createAccount(context, {
    additionals,
    shopId,
    tokenObj,
    user
  });

  return {
    account,
    clientMutationId
  };
}
