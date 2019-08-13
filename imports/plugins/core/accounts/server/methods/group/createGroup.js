import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import { check, Match } from "meteor/check";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";
import { Groups } from "/lib/collections";

/**
 * @name group/createGroup
 * @method
 * @memberof Group/Methods
 * @summary Creates a new permission group for a shop
 * It creates permission group for a given shop with passed in roles
 * @param {Object} groupData - info about group to create
 * @param {String} groupData.name - name of the group to be created
 * @param {String} groupData.description - Optional description of the group to be created
 * @param {Array} groupData.permissions - permissions to assign to the group being created
 * @param {String} shopId - id of the shop the group belongs to
 * @returns {Object} - `object.status` of 200 on success or Error object on failure
 */
export default function createGroup(groupData, shopId) {
  check(groupData, Object);
  check(groupData.name, String);
  check(groupData.description, Match.Optional(String));
  check(groupData.permissions, Match.Optional([String]));
  check(shopId, String);
  let _id;

  // we are limiting group method actions to only users with admin roles
  // this also include shop owners, since they have the `admin` role in their Roles.GLOBAL_GROUP
  if (!Reaction.hasPermission("admin", Reaction.getUserId(), shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const defaultCustomerGroupForShop = Groups.findOne({ slug: "customer", shopId }) || {};
  const defaultAdminPermissions = (defaultCustomerGroupForShop.permissions || []).concat("dashboard");
  const newGroupData = Object.assign({}, groupData, {
    slug: Reaction.getSlug(groupData.name), shopId
  });

  if (!newGroupData.permissions) {
    newGroupData.permissions = [];
  }

  newGroupData.permissions = _.uniq([...newGroupData.permissions, ...defaultAdminPermissions]);

  // ensure one group type per shop
  const groupExists = Groups.findOne({ slug: newGroupData.slug, shopId });
  if (groupExists) {
    throw new ReactionError("conflict", "Group already exist for this shop");
  }
  try {
    _id = Groups.insert(newGroupData);
  } catch (error) {
    Logger.error(error);
    throw new ReactionError("invalid-parameter", "Bad request");
  }

  return { status: 200, group: Groups.findOne({ _id }) };
}
