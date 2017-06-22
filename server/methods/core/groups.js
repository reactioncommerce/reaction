import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Random } from "meteor/random";
import { Roles } from "meteor/alanning:roles";
import { Logger } from "/server/api";
import { Accounts, Shops } from "/lib/collections";
import { getSlug } from "/lib/api";

/**
 * Reaction Permission Group Methods
 */
Meteor.methods({
  /**
   * group/createGroup
   * @summary creates a new permission group for a shop
   * It creates permission group for a given shop with passed in roles
   * It enforces uniqueness of group slug, since it's hard to enforce at schema level being array of objects
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
    check(groupData.permissions, [String]);
    check(shopId, String);

    if (!Roles.userIsInRole(Meteor.userId(), "admin", shopId)) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const currentGroups = _.get(Shops.findOne({ _id: shopId }), "groups", []);
    const group = Object.assign({}, groupData, {
      _id: Random.id(),
      slug: getSlug(groupData.name),
      createdAt: new Date()
    });
    const groupExists = currentGroups.map(grp => grp.slug).indexOf(group.slug) > -1;

    if (groupExists) {
      throw new Meteor.Error(400, "Bad request");
    }

    const shop = Shops.update({ _id: shopId }, { $push: { groups: group } });

    if (!shop) {
      throw new Meteor.Error(400, "Bad request");
    }

    return { shop, status: 200 };
  },

  /**
   * group/updateGroup
   * @summary updates a permission group for a shop
   * updates either the name of the permission group or it list of permissions
   * It also goes into affected user data to modify both the groupName (using Accounts schema)
   * and group permissions (using "accounts/removeUserPermissions")
   * @param {Object} group - current data of the group to be updated
   * @param {String} group.name - name of the group
   * @param {String} group.description - Optional description of the group to be created
   * @param {Array} group.permissions - permissions of the grop
   * @param {Object} newGroupData - updated group info (similar to current group data)
   * @param {String} shopId - id of the shop the group belongs to
   * @return {Object} - object.status of 200 on success or Error object on failure
   */
  "group/updateGroup": function (group, newGroupData, shopId) {
    check(group, Object);
    check(group.name, String);
    check(group.permissions, [String]);

    check(newGroupData, Object);
    check(newGroupData.name, String);
    check(newGroupData.permissions, [String]);
    check(shopId, String);

    if (!Roles.userIsInRole(Meteor.userId(), "admin", shopId)) {
      throw new Meteor.Error(403, "Access Denied");
    }

    // 1. Update the group data on the shop doc
    const currentGroups = _.get(Shops.findOne({ _id: shopId }), "groups", []);
    const groups = currentGroups.map(grp => {
      if (grp._id === group._id) {
        return Object.assign({}, group, newGroupData, { slug: getSlug(newGroupData.name) });
      }
      delete grp._id;
      delete grp.createdAt;
      return grp;
    });
    Shops.update({ _id: shopId }, { $set: { groups } });

    // 2. Check & Modify users in the group that changed
    const permissionsChanged = !_.isEqual(group.permissions, newGroupData.permissions);
    const matchQuery = { $elemMatch: { shopId: shopId, groupId: group._id } };
    const users = Accounts.find({ groups: matchQuery }).fetch();
    let error;

    if (permissionsChanged) {
      error = setUserPermissions(users, group, newGroupData, shopId);
    }

    // 3. Return response
    if (!error) {
      return { status: 200 };
    }
    Logger.error(error);
    throw new Meteor.Error(500, "Update not successful");
  },
  /**
   * group/addUser
   * @summary adds a user to a permission group for a shop
   * It updates the user's list of permissions/roles with the defined the list defined for the group
   * @param {String} userId - current data of the group to be updated
   * @param {Object} groupData - info about the group
   * @param {String} shopId - permissions of the group
   * @return {Object} - object.status of 200 on success or Error object on failure
   */
  "group/addUser": function (userId, groupData, shopId) {
    check(userId, String);
    check(groupData, Object);
    check(groupData.name, String);
    check(groupData.permissions, [String]);
    check(shopId, String);

    const user = Accounts.findOne({ _id: userId });

    try {
      Meteor.call("accounts/addUserPermissions", user.userId, groupData.permissions, shopId);
      changeUserGroupOnAccount(user, groupData._id, shopId);
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
   * @param {String} groupName - name of the group
   * @param {String} shopId - permissions of the group
   * @return {Object} - object.status of 200 on success or Error object on failure
   */
  "group/removeUser": function (userId, groupName, shopId) {
    check(userId, String);
    check(groupName, String);
    check(shopId, String);

    const user = Accounts.findOne({ _id: userId });

    if (!user) {
      throw new Meteor.Error(404, "Could not find user");
    }

    const permissions = getGroupPermissions(Shops.findOne({ _id: shopId }).groups, groupName);
    try {
      Meteor.call("accounts/removeUserPermissions", user._id, permissions, shopId);
      changeUserGroupOnAccount(user, null, shopId); // set group name to null on the user account
      return { status: 200 };
    } catch (error) {
      Logger.error(error);
      throw new Meteor.Error(500, "Could not add user");
    }
  }
});

// add/remove the id of a group to a user account
function changeUserGroupOnAccount(users, groupId, shopId) {
  let affectedUsers = users;
  if (!Array.isArray(users)) {
    affectedUsers = [users];
  }
  return affectedUsers.forEach(user => {
    if (!user.groups) { // if no groups on account yet, set default
      user.groups = [{ shopId }];
    }
    user.groups = user.groups.map(group => {
      if (group.shopId === shopId) {
        group.groupId = [groupId || ""];
      }
      return group;
    });

    const updateQuery = { groups: user.groups };
    Accounts.update({ _id: user._id }, { $set: updateQuery });
  });
}

function setUserPermissions(users, oldGroup, newGroupData, shopId) {
  let affectedUsers = users;
  if (!Array.isArray(users)) {
    affectedUsers = [users];
  }
  // todo: default roles ??
  return affectedUsers.forEach(user => Roles.setUserRoles(user._id, newGroupData.permissions, shopId));
}

function getGroupPermissions(groups, name) {
  return _.get(_.find(groups, { name }), "permissions", []);
}
