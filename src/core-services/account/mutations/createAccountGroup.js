import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";
import getSlug from "@reactioncommerce/api-utils/getSlug.js";

/**
 * @name group/createAccountGroup
 * @method
 * @memberof Group/Methods
 * @summary Creates a new permission group for a shop
 * It creates permission group for a given shop with passed in roles
 * This method also effectively creates a role in reaction authorization service with the same
 * name as the supplied group if kafka connect mongo has been configured on the mongo db
 * @param {object} context - The GraphQL context
 * @param {String} context.shopId - id of the shop the group belongs to
 * @param {object} input - The input supplied from GraphQL
 * @param {Object} input.groupData - info about group to create
 * @param {String} input.groupData.name - name of the group to be created
 * @param {String} input.groupData.description - Optional description of the group to be created
 * @param {Array} input.groupData.permissions - permissions to assign to the group being created
 * @param {Array} input.groupData.members - members of the
 * @returns {Object} - `object.status` of 200 on success or Error object on failure
 */
export default async function createAccountGroup(context, input) {
  const { group, shopId } = input;
  let newlyCreatedGroup;
  const { Groups } = context.collections;

  // we are limiting group method actions to only users within the account managers role
  await context.validatePermissions("reaction:legacy:groups", "create", { shopId });

  const nowDate = new Date();
  const newGroupData = Object.assign({}, group, {
    slug: getSlug(group.name),
    shopId,
    createdAt: nowDate,
    updatedAt: nowDate
  });

  // TODO: Remove when we move away from legacy permission verification
  if (!newGroupData.permissions) {
    newGroupData.permissions = [];
  }

  // ensure one group type per shop
  const groupExists = await Groups.findOne({ slug: newGroupData.slug, shopId });

  if (groupExists) {
    throw new ReactionError("conflict", "Group already exist for this shop");
  }

  try {
    /** Kafka connect mongo should be listening for insert events
     and should place the newly created group on the kakfa groups topic.
     reaction authorization listens on the topic and creates role (group) in
     reaction authorization
     */

    const result = await Groups.insertOne(newGroupData);
    newlyCreatedGroup = result.ops ? result.ops[0] : {};
  } catch (error) {
    Logger.error(error);
    throw new ReactionError("invalid-parameter", "Bad request");
  }

  return { group: newlyCreatedGroup };
}
