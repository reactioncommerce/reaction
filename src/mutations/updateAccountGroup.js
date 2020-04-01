import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name group/updateAccountGroup
 * @method
 * @memberof Group/Methods
 * @summary Updates an existing permission group for a shop
 * It updates permission group for a given shop with passed in roles
 * This method also effectively updates a role in reaction authorization service with the same
 * name as the supplied group if kafka connect mongo has been configured on the mongo db
 * @param {object} context - The GraphQL context
 * @param {object} input - The input supplied from GraphQL
 * @param {String} input.shopId - id of the shop the group belongs to
 * @param {Object} input.group - info about group to updated
 * @param {String} input.group.name - name of the group to be updated
 * @param {String} input.group.description - Optional description of the group to be updated
 * @returns {Object} Updated group
 */
export default async function updateAccountGroup(context, input) {
  const { group, groupId, shopId } = input;
  const {
    appEvents,
    collections: { Groups },
    simpleSchemas: { Group },
    user
  } = context;

  // we are limiting group method actions to only users within the account managers role
  await context.validatePermissions(`reaction:legacy:groups:${groupId}`, "update", { shopId });

  // Ensure group exists before proceeding
  const existingGroup = await Groups.findOne({ _id: groupId, shopId });
  if (!existingGroup) {
    throw new ReactionError("not-found", `Group with ID (${groupId}) doesn't exist`);
  }

  const modifier = {
    $set: {
      ...group,
      updatedAt: new Date()
    }
  };

  // Validate final group object
  Group.validate(modifier, { modifier: true });

  /** Kafka connect mongo should be listening for update events
  and should place the updated group on the Kafka groups topic.
  reaction authorization listens on the topic and updates role (group) in
  reaction authorization
  */
  const { value: updatedGroup } = await Groups.findOneAndUpdate(
    { _id: groupId },
    modifier,
    {
      returnOriginal: false
    }
  );

  if (!updatedGroup) throw new ReactionError("server-error", `Unable to update Group ${group._id}`);

  await appEvents.emit("afterAccountGroupUpdate", {
    group: updatedGroup,
    updatedBy: user._id,
    updatedFields: Object.keys(modifier.$set)
  });

  return updatedGroup;
}
