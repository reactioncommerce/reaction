import ReactionError from "@reactioncommerce/reaction-error";
import SimpleSchema from "simpl-schema";
import getSlug from "@reactioncommerce/api-utils/getSlug.js";
import defaultAccountGroups from "../util/defaultAccountGroups.js";

const inputSchema = new SimpleSchema({
  "slug": { type: String, optional: true },
  "name": { type: String, optional: true },
  "description": { type: String, optional: true },
  "permissions": { type: Array, optional: true },
  "permissions.$": String,
  "updatedAt": Date
});

/**
 * @name group/updateAccountGroup
 * @method
 * @memberof Group/Methods
 * @summary Updates an existing permission group for a shop
 * It updates permission group for a given shop with passed in roles
 * This method also effectively updates a role in reaction authorization service with the same
 * name as the supplied group if kafka connect mongo has been configured on the mongo db
 * @param {object} context - The GraphQL context
 * @param {String} context.shopId - id of the shop the group belongs to
 * @param {object} input - The input supplied from GraphQL
 * @param {Object} input.groupData - info about group to updated
 * @param {String} input.groupData.name - name of the group to be updated
 * @param {String} input.groupData.description - Optional description of the group to be updated
 * @param {Array} input.groupData.permissions - permissions to assign to the group being updated
 * @param {Array} input.groupData.members - members of the
 * @returns {Object} - `object.status` of 200 on success or Error object on failure
 */
export default async function updateAccountGroup(context, input) {
  const { group, groupId, shopId } = input;
  const { appEvents, user } = context;
  const { Groups } = context.collections;

  // we are limiting group method actions to only users within the account managers role
  await context.validatePermissions(`reaction:legacy:groups:${groupId}`, "update", { shopId });

  // Ensure group exists before proceeding
  const existingGroup = await Groups.findOne({ _id: groupId });

  if (!existingGroup) {
    throw new ReactionError("not-found", `Group with ID (${groupId}) doesn't exist`);
  }

  const updateGroupData = {
    updatedAt: new Date()
  };

  // Update the name if provided
  if (group.name) {
    updateGroupData.name = group.name;
  }

  // Prevent updating the slug of the default groups.
  // For example, changing the slug of the shop manager group could cause various features of the application to stop working as intended.
  if (defaultAccountGroups.includes(existingGroup.slug) && group.slug && group.slug !== existingGroup.slug) {
    throw new ReactionError("access-denied", `Field 'slug' cannot be updated for default group with ID (${groupId}) and name (${existingGroup.name}).`);
  } else if (group.slug) { // Update the slug if available for other groups
    updateGroupData.slug = getSlug(group.slug);
  }

  // Update description
  if (group.description) {
    updateGroupData.description = group.description;
  }

  // Update the permissions on the group and any user in those groups
  if (Array.isArray(group.permissions)) {
    updateGroupData.permissions = group.permissions;
  }

  // Validate final group object
  inputSchema.validate(updateGroupData);

  /** Kafka connect mongo should be listening for update events
  and should place the updated group on the kakfa groups topic.
  reaction authorization listens on the topic and updates role (group) in
  reaction authorization
  */
  const { value: updatedGroup } = await Groups.findOneAndUpdate(
    { _id: groupId },
    {
      $set: updateGroupData
    },
    {
      returnOriginal: false
    }
  );

  if (!updatedGroup) throw new ReactionError("server-error", `Unable to update Group ${group._id}`);

  await appEvents.emit("afterAccountGroupUpdate", {
    account: updatedGroup,
    updatedBy: user._id,
    updatedFields: Object.keys(updateGroupData)
  });

  return updatedGroup;
}
