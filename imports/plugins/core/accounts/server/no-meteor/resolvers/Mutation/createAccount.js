import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";
import { decodeUserOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/user";

/**
 * @name Mutation/createAccount
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver for the createAccount GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {String} [args.input.bio] - bio to display on profile
 * @param {String} [args.input.name] - name to display on profile
 * @param {String} [args.input.picture] - picture to display on profile
 * @param {String} args.input.shopId - shop to create account for
 * @param {String} [args.input.username] - username to display on profile
 * @param {String} args.input.user - user to create account from
 * @param {String} [args.input.verificationToken] - token for account verification
 * @param {Object} context - an object containing the per-request state
 * @returns {Object} createAccountPayload
 */
export default async function createAccount(parentResult, { input }, context) {
  const { bio, name, picture, shopId: opaqueShopId, username, userId: opaqueUserId, verificationToken, clientMutationId = null } = input;

  const account = await context.mutations.createAccount(context, {
    bio,
    name,
    picture,
    shopId: decodeShopOpaqueId(opaqueShopId),
    username,
    userId: decodeUserOpaqueId(opaqueUserId),
    verificationToken
  });

  return {
    account,
    clientMutationId
  };
}
