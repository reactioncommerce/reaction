import _ from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";
import SimpleSchema from "simpl-schema";
import getSlug from "@reactioncommerce/api-utils/getSlug.js";
import setRolesOnGroupAndUsers from "../util/setRolesOnGroupAndUsers.js";

const inputSchema = new SimpleSchema({
  slug: { type: String, optional: true },
  name: { type: String, optional: true },
  description: { type: String, optional: true },
  updatedAt: Date
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
  await context.validatePermissions("reaction:accounts", "update:group", { shopId, legacyRoles: ["admin"] });

  const defaultCustomerGroupForShop = await Groups.findOne({ slug: "customer", shopId }) || {};

  // TODO: Remove when we move away from legacy permission verification
  const defaultCustomerPermissions = defaultCustomerGroupForShop.permissions;

  // Ensure group exists before proceeding
  const existingGroup = await Groups.findOne({ _id: groupId });

  if (!existingGroup) {
    throw new ReactionError("not-found", `Group with ID (${groupId}) doesn't exist`);
  }

  let updatedFields = [];

  const updateGroupData = {
    updatedAt: new Date()
  };

  // Update the name if provided
  if (group.name) {
    updateGroupData.name = group.name;
  }

  // Update the slug if available, or sligufy the name
  if (group.slug) {
    updateGroupData.slug = getSlug(group.slug);
  } else if (group.name && !group.slug) {
    updateGroupData.slug = getSlug(group.name);
  }

  // Update description
  if (group.description) {
    updateGroupData.description = group.description;
  }

  // Add updated fields used for appEvents
  updatedFields = Object.keys(updateGroupData);

  // TODO: Remove when we move away from legacy permission verification
  // Update the roles on the group and any user in those groups
  if (Array.isArray(group.permissions)) {
    const roles = _.uniq([...group.permissions, ...defaultCustomerPermissions]);
    await setRolesOnGroupAndUsers(context, existingGroup, roles);
    updatedFields.push("permissions");
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
    updatedFields
  });

  return updatedGroup;
}
