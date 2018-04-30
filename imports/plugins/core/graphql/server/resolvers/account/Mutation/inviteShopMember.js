import { decodeGroupOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/group";
import { decodeShopOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/shop";

/**
 * @name "Mutation.inviteShopMember"
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver for the inviteShopMember GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.email - The email address of the person to invite
 * @param {String} args.input.groupId - The permission group for this person's new account
 * @param {String} args.input.name - The permission group for this person's new account
 * @param {String} args.input.shopId - The ID of the shop to which you want to invite this person
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @return {Object} InviteShopMemberPayload
 */
export default function inviteShopMember(_, { input }, context) {
  const { email, groupId, name, shopId, clientMutationId = null } = input;
  const options = {
    email,
    groupId: decodeGroupOpaqueId(groupId),
    name,
    shopId: decodeShopOpaqueId(shopId)
  };
  const account = context.methods["accounts/inviteShopMember"](context, [options]);
  return {
    account,
    clientMutationId
  };
}
