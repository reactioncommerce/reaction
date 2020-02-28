import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
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
 * @param {Object} context - The GraphQL context
 * @param {Object} input - The input supplied from GraphQL
 * @param {String} input.shopId - ID of the shop the group belongs to
 * @param {Object} input.group - info about group to create
 * @param {String} input.group.name - name of the group to be created
 * @param {String} input.group.description - Optional description of the group to be created
 * @returns {Object} An object where `group` is the newly created group.
 */
export default async function createAccountGroup(context, input) {
  const { group, shopId = null } = input;
  const {
    accountId,
    appEvents,
    collections: { Groups },
    simpleSchemas: { Group },
    userId
  } = context;

  // we are limiting group method actions to only users within the account managers role
  await context.validatePermissions("reaction:legacy:groups", "create", { shopId });

  const nowDate = new Date();
  const newGroup = Object.assign({}, group, {
    _id: Random.id(),
    createdAt: nowDate,
    createdBy: accountId,
    shopId,
    slug: group.slug || getSlug(group.name),
    updatedAt: nowDate
  });

  // ensure one group type per shop
  const groupExists = await Groups.findOne({ slug: newGroup.slug, shopId });

  if (groupExists) {
    throw new ReactionError("conflict", "Group already exist for this shop");
  }

  Group.validate(newGroup);

  Logger.debug(`creating group ${newGroup.slug} for shop ${shopId}`);

  try {
    /** Kafka connect mongo should be listening for insert events
     and should place the newly created group on the Kafka groups topic.
     reaction authorization listens on the topic and creates role (group) in
     reaction authorization
     */

    await Groups.insertOne(newGroup);
  } catch (error) {
    Logger.error(error);
    throw new ReactionError("invalid-parameter", "Bad request");
  }

  await appEvents.emit("afterAccountGroupCreate", {
    createdBy: userId,
    group: newGroup
  });

  return { group: newGroup };
}
