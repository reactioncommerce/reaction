import ReactionError from "@reactioncommerce/reaction-error";
import { decodeGroupOpaqueId, decodeShopOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation/inviteShopMember
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver for the inviteShopMember GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.email - The email address of the person to invite
 * @param {String} args.input.groupId - The permission group for this person's new account (deprecated)
 * @param {String} args.input.groupIds - The permission groups for this person's new account
 * @param {String} args.input.name - The permission group for this person's new account
 * @param {String} args.input.shopId - The ID of the shop to which you want to invite this person
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Object} InviteShopMemberPayload
 */
export default async function inviteShopMember(_, { input }, context) {
  const { email, groupId, name, shopId, clientMutationId = null } = input;
  let { groupIds } = input;

  // If user is using deprecated `groupId` instead of `groupIds`, populate `groupIds`
  if (groupId && (!Array.isArray(groupIds) || groupIds.length === 0)) {
    groupIds = [groupId];
  }

  // If user is passing both `groupId` and `groupIds`, throw an error
  if (groupId && Array.isArray(groupIds) && groupIds.length > 0) {
    throw new ReactionError("invalid-parameter", "Can't specify both groupId and groupIds.");
  }

  const decodedGroupIds = groupIds.map((groupId) => decodeGroupOpaqueId(groupId));
  const decodedShopId = decodeShopOpaqueId(shopId);

  const account = await context.mutations.inviteShopMember(context, {
    email,
    groupIds: decodedGroupIds,
    name,
    shopId: decodedShopId
  });

  return {
    account,
    clientMutationId
  };
}
