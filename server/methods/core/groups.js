import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import { Reaction, Logger, Hooks } from "/server/api";
import { Accounts, Groups } from "/lib/collections";
import { getSlug } from "/lib/api";

/**
 * Reaction Permission Group Methods
 */
Meteor.methods({
  /**
   * group/createGroup
   * @summary creates a new permission group for a shop
   * It creates permission group for a given shop with passed in roles
   * @param {Object} groupData - info about group to create
   * @param {String} groupData.name - name of the group to be created
   * @param {String} groupData.description - Optional description of the group to be created
   * @param {Array} groupData.permissions - permissions to assign to the group being created
   * @param {String} shopId - id of the shop the group belongs to
   * @return {Object} - object.status of 200 on success or Error object on failure
   */
  "group/createGroup": function (groupData, shopId) {
    check(groupData, Object);
    check(groupData.name, String);
    check(groupData.description, Match.Optional(String));
    check(groupData.permissions,  Match.Optional([String]));
    check(shopId, String);
    let _id;

    if (!Reaction.hasPermission("admin", Meteor.userId(), shopId)) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const newGroupData = Object.assign({}, groupData, {
      slug: getSlug(groupData.name), shopId
    });

    // ensure one group type per shop
    const groupExists = Groups.findOne({ slug: newGroupData.slug, shopId });
    if (groupExists) {
      throw new Meteor.Error(409, "Group already exist for this shop");
    }
    try {
      _id = Groups.insert(newGroupData);
    } catch (error) {
      Logger.error(error);
      throw new Meteor.Error(400, "Bad request");
    }

    return { status: 200, group: Groups.findOne({ _id }) };
  },

  /**
   * group/updateGroup
   * @summary updates a permission group for a shop
   * changes the details of a group (name, desc, permissions etc) to the values passed in.
   * It also goes into affected user data to modify both the groupName (using Accounts schema)
   * and group permissions (using "accounts/removeUserPermissions")
   * @param {Object} groupId - group to be updated
   * @param {Object} newGroupData - updated group info (similar to current group data)
   * @param {String} shopId - id of the shop the group belongs to
   * @return {Object} - object.status of 200 on success or Error object on failure
   */
  "group/updateGroup": function (groupId, newGroupData, shopId) {
    check(groupId, String);
    check(newGroupData, Object);
    check(shopId, String);

    if (!Reaction.hasPermission("admin", Meteor.userId(), shopId)) {
      throw new Meteor.Error(403, "Access Denied");
    }

    // 1. Update the group data
    let update = newGroupData;
    if (newGroupData.name) {
      update = Object.assign({}, newGroupData, { slug: getSlug(newGroupData.name) });
    }

    Groups.update({ _id: groupId, shopId }, { $set: update });

    // 2. Check & Modify users in the group that changed
    const users = Accounts.find({ groups: { $in: [groupId] } }).fetch();
    let error;

    if (newGroupData.permissions && newGroupData.permissions.length) {
      error = setUserPermissions(users, newGroupData.permissions, shopId);
    }

    // 3. Return response
    if (!error) {
      return { status: 200, group: Groups.findOne({ _id: groupId }) };
    }
    Logger.error(error);
    throw new Meteor.Error(500, "Update not successful");
  },
  /**
   * group/addUser
   * @summary adds a user to a permission group
   * It updates the user's list of permissions/roles with the defined the list defined for the group
   * @param {String} userId - current data of the group to be updated
   * @param {String} groupId - id of the group
   * @return {Object} - object.status of 200 on success or Error object on failure
   */
  "group/addUser": function (userId, groupId) {
    check(userId, String);
    check(groupId, String);

    const { permissions, shopId } = Groups.findOne({ _id: groupId }) || {};

    if (!Reaction.hasPermission("admin", Meteor.userId(), shopId)) {
      throw new Meteor.Error(403, "Access Denied");
    }

    try {
      setUserPermissions({ _id: userId }, permissions, shopId);
      Accounts.update({ _id: userId }, { $set: { groups: [groupId] } });
      return { status: 200 };
    } catch (error) {
      Logger.error(error);
      throw new Meteor.Error(500, "Could not add user");
    }
  },

  /**
   * group/removeUser
   * @summary removes a user from a group for a shop, and updates the user's permission list
   * @param {String} userId - current data of the group to be updated
   * @param {String} groupId - name of the group
   * @return {Object} - object.status of 200 on success or Error object on failure
   */
  "group/removeUser": function (userId, groupId) {
    check(userId, String);
    check(groupId, String);

    const user = Accounts.findOne({ _id: userId });
    const { permissions, shopId } = Groups.findOne({ _id: groupId }) || {};

    if (!Reaction.hasPermission("admin", Meteor.userId(), shopId)) {
      throw new Meteor.Error(403, "Access Denied");
    }

    if (!user) {
      throw new Meteor.Error(404, "Could not find user");
    }

    try {
      Meteor.call("accounts/removeUserPermissions", userId, permissions, shopId);
      Accounts.update({ _id: userId }, { $pull: { groups: groupId } });
      return { status: 200 };
    } catch (error) {
      Logger.error(error);
      throw new Meteor.Error(500, "Could not add user");
    }
  }
});

function setUserPermissions(users, permissions, shopId) {
  let affectedUsers = users;
  if (!Array.isArray(users)) {
    affectedUsers = [users];
  }

  return affectedUsers.forEach(user => Roles.setUserRoles(user._id, permissions, shopId));
}

// set default admin user's account as "owner"
Hooks.Events.add("afterCreateDefaultAdminUser", (user) => {
  const group = Groups.findOne({ slug: "owner", shopId: Reaction.getShopId() });
  Accounts.update({ _id: user._id  }, { $set: { groups: [group._id] } });
});
