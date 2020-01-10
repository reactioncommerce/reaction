import ReactionError from "@reactioncommerce/reaction-error";
import moveAccountsToGroup from "../util/moveAccountsToGroup.js";

/**
 * @name group/removeAccountGroup
 * @method
 * @memberof Group/Methods
 * @summary Removes an existing permission group for a shop
 * This method also effectively removes a role in reaction authorization service with the same
 * name as the supplied group if kafka connect mongo has been configured on the mongo db
 * @param {object} context - The GraphQL context
 * @param {object} input - The input supplied from GraphQL
 * @param {String} input.groupId - id of the group to remove
 * @param {String} input.shopId - id of the shop the group belongs to
 * @param {String} input.newGroupId - id of the group to move users to. Cannot be the same as groupId
 * @returns {Object} - `object.status` of 200 on success or Error object on failure
 */
export default async function removeAccountGroup(context, input) {
  const { groupId, shopId } = input;
  const { appEvents, user } = context;
  const { Groups } = context.collections;

  // we are limiting group method actions to only users within the account managers role
  await context.validatePermissions("reaction:accounts", "remove:group", { shopId, legacyRoles: ["admin"] });

  const defaultCustomerGroupForShop = await Groups.findOne({ slug: "customer", shopId }) || {};

  // TODO: Remove when we move away from legacy permission verification
  // Move accounts from their old group to their new group
  await moveAccountsToGroup(context, {
    shopId,
    fromGroupId: groupId,
    toGroupId: defaultCustomerGroupForShop._id
  });

  /** Kafka connect mongo should be listening for update events
  and should place the updated group on the kakfa groups topic.
  reaction authorization listens on the topic and updates role (group) in
  reaction authorization
  */
  const { value: deletedGroup } = await Groups.findOneAndDelete({ _id: groupId });

  if (!deletedGroup) throw new ReactionError("server-error", `Unable to update Group ${groupId}`);

  await appEvents.emit("afterAccountGroupDelete", {
    group: deletedGroup,
    updatedBy: user._id
  });

  return deletedGroup;
}
