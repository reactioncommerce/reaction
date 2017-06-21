import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
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
   * creates permission group for a given shop with passed in roles
   * @param {Object} groupData - info about group to create
   * @param {String} groupData.name - name of the group to be created
   * @param {Array} groupData.permissions - permissions to assign to the group being created
   * @param {String} shopId - id of the shop the group belongs to
   * @return {Object} - object.status of 200 on success or Error object on failure
   */
  "group/createGroup": function (groupData, shopId) {
    check(groupData, Object);
    check(groupData.name, String);
    check(groupData.permissions, [String]);
    check(shopId, String);

    if (!Roles.userIsInRole(Meteor.userId(), "admin", shopId)) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const group = Object.assign({}, groupData, { slug: getSlug(groupData.name) });
    const shop = Shops.update({ _id: shopId }, { $addToSet: { groups: group } });

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

    const permissionsChanged = !_.isEqual(group.permissions, newGroupData.permissions);
    const updateQuery = { "groups.$": newGroupData };

    Shops.update({ _id: shopId, groups: group }, { $set: updateQuery });

    const matchQuery = { $elemMatch: { shopId: shopId, names: group.name } };
    const affectedUsers = Accounts.find({ groups: matchQuery }).fetch();
    let error;

    if (permissionsChanged) {
      error = updateUsersPermissions(affectedUsers, group, newGroupData, shopId);
    }

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
   * It uses the local *updateUsers-* by passing one user as an array
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
      updateUsersGroupName([user], shopId);
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
      updateUsersPermissions([user], { permissions }, {}, shopId); // delete all permissions belonging to that group
      updateUsersGroupName([user], shopId); // update grouop name on the user account
      return { status: 200 };
    } catch (error) {
      Logger.error(error);
      throw new Meteor.Error(500, "Could not add user");
    }
  }
});

function updateUsersGroupName(affectedUsers, shopId) {
  const { groups } = Shops.findOne({ _id: shopId });

  return affectedUsers.forEach(user => {
    const userRoles = Roles.getRolesForUser(user._id, shopId);
    if (!user.groups) {
      user.groups = [{ shopId, names: [] }]; // if no groups found, set first group
    }
    user.groups = user.groups.map(group => {
      if (group.shopId === shopId) {
        group.names = getUserGroups(groups, userRoles);
      }
      return group;
    });

    const updateQuery = { groups: user.groups };
    Accounts.update({ _id: user._id }, { $set: updateQuery });
  });

  function getUserGroups(groupsInShop, userRoles) {
    return _.compact(groupsInShop.map(group => {
      // check if user roles contain permissions for a group (which makes them "belong" to the group)
      const belongs = _.difference(group.permissions, userRoles).length === 0;
      if (belongs) return group.name;
    }));
  }
}

function updateUsersPermissions(affectedUsers, oldGroup, newGroupData, shopId) {
  return affectedUsers.forEach(user => {
    // remove all, then addUserPermissions
    Roles.setUserRoles(user._id, newGroupData.permissions, shopId);
    // defaultRoles needed here too, since we just did a reset
    // Meteor.call("accounts/addUserPermissions", user.userId, newGroupData.permissions, shopId);
  });
}

function getGroupPermissions(groups, name) {
  return _.get(_.find(groups, { name }), "permissions", []);
}
