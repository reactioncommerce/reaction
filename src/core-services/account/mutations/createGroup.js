import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name group/createGroup
 * @method
 * @memberof Group/Methods
 * @summary Creates a new permission group for a shop
 * It creates permission group for a given shop with passed in roles
 * @param {object} input - The input supplied from GraphQL
 * @param {Object} input.groupData - info about group to create
 * @param {String} input.groupData.name - name of the group to be created
 * @param {String} input.groupData.description - Optional description of the group to be created
 * @param {Array} input.groupData.permissions - permissions to assign to the group being created
 * @param {Array} input.groupData.members - members of the
 * @param {object} context - The GraphQL context
 * @param {String} context.shopId - id of the shop the group belongs to
 * @returns {Object} - `object.status` of 200 on success or Error object on failure
 */
export default async function createGroup(input, context) {
  const { group, shopId } = input;
  let _id;
  const {
    collections: {
      Groups
    }
  } = context;

  // (LEGACY) we are limiting group method actions to only users with admin roles
  // this also include shop owners, since they have the `admin` role
  await context.validatePermissionsLegacy(["admin"], null, { shopId });

  // we are limiting group method actions to only users within the account managers role
  await context.validatePermissions("reaction:account", "create", { shopId });

  const defaultCustomerGroupForShop = Groups.findOne({ slug: "customer", shopId }) || {};

  // TODO: Remove when we move away from legacy permission verification
  const defaultAdminPermissions = (defaultCustomerGroupForShop.permissions || []).concat("dashboard");
  const newGroupData = Object.assign({}, group, {
    slug: context.getSlug(group.name), shopId
  });

  // TODO: Remove when we move away from legacy permission verification
  if (!newGroupData.permissions) {
    newGroupData.permissions = [];
  }

  // TODO: Remove when we move away from legacy permission verification
  newGroupData.permissions = _.uniq([...newGroupData.permissions, ...defaultAdminPermissions]);

  // ensure one group type per shop
  const groupExists = Groups.findOne({ slug: newGroupData.slug, shopId });

  if (groupExists) {
    throw new ReactionError("conflict", "Group already exist for this shop");
  }

  try {
    // Kafka connect mongo should be listening for insert events
    // and should place the newly created group on the kakfa groups topic
    // reaction authorization listens on the topic and creates role (group)
    // reaction authorization
    _id = Groups.insert(newGroupData);
  } catch (error) {
    Logger.error(error);
    throw new ReactionError("invalid-parameter", "Bad request");
  }

  return { status: 200, group: Groups.findOne({ _id }) };
}
