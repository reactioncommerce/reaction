import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import { Logger } from "/server/api";
import { Accounts, Shops } from "/lib/collections";

/**
 * Reaction Group Permission Methods
 * TODO: Confirm if better to move this to shop.js since groups are on shops
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

    // must have needed permissions.. .TODO: Review who can create a group permission for a shop
    if (!Roles.userIsInRole(Meteor.userId(), "admin", shopId)) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const shop = Shops.update({ _id: shopId }, { $addToSet: { groups: groupData } });

    if (!shop) {
      throw new Meteor.Error(400, "Bad request data");
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

    // must have needed permissions.. .TODO: Review who can create a group permission for a shop
    if (!Roles.userIsInRole(Meteor.userId(), "admin", shopId)) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const groupNameChanged = group.name !== newGroupData.name;
    const permissionsChanged = !_.isEqual(group.permissions, newGroupData.permissions);
    const updateQuery = { "groups.$": newGroupData };

    Shops.update({ _id: shopId, groups: group }, { $set: updateQuery });

    const matchQuery = { $elemMatch: { shopId: shopId, names: group.name } };
    const affectedUsers = Accounts.find({ groups: matchQuery }).fetch();
    let error;

    if (groupNameChanged) {
      error = updateUsersGroupName(affectedUsers, group.name, newGroupData.name, shopId);
    }

    if (permissionsChanged) {
      error = updateUsersPermissions(affectedUsers, group, shopId);
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
   * It uses the local *updateAllAffectedUsers-* by passing one user as an array
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
    const belongsToShopGroup = _.find(user.groups, { shopId });
    if (!belongsToShopGroup) {
      user.groups = (user.groups || []).concat({
        shopId,
        names: [groupData.name]
      });
    }

    try {
      updateUsersGroupName([user], "", groupData.name, shopId);
      Meteor.call("accounts/addUserPermissions", user.userId, groupData.permissions, shopId);
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
    const shopGroup = _.find(user.groups, { shopId });
    if (shopGroup) {
      _.remove(shopGroup.names, name => name === groupName);
    }
    const updatedGroups = _.filter(user.groups, group => group.shopId !== shopId)
      .concat([shopGroup]);

    Accounts.update({ _id: user._id }, { $set: { groups: updatedGroups } });
    // delete all permissions belonging to that group & re-populate for remaining groups
    const shop = Shops.findOne({ _id: shopId });
    const permissions = getGroupPermissions(shop.groups, groupName);
    try {
      updateUsersPermissions([user], { permissions }, shopId);
      return { status: 200 };
    } catch (error) {
      Logger.error(error);
      throw new Meteor.Error(500, "Could not add user");
    }
  }
});

function updateUsersGroupName(affectedUsers, groupName, newName, shopId) {
  return affectedUsers.forEach(user => {
    user.groups = user.groups.map(group => {
      if (group.shopId === shopId) {
        group.names = upsertArrayItem(group.names, groupName, newName);
      }
      return group;
    });
    const updateQuery = { groups: user.groups };
    Accounts.update({ _id: user._id }, { $set: updateQuery });
  });

  function upsertArrayItem(array, item, newItem) {
    return _.uniq(array
      .map(insertIfMatchFound)
      .concat([newItem])
    );
    function insertIfMatchFound(value) {
      if (value === item) return newItem;
      return value;
    }
  }
}

function updateUsersPermissions(affectedUsers, oldGroup, shopId) {
  const shop = Shops.findOne({ _id: shopId });
  const oldPermissions = oldGroup.permissions || [];
  return affectedUsers.forEach(user => {
    if (oldPermissions.length) {
      // requires "reaction-accounts" permission access
      Meteor.call("accounts/removeUserPermissions", user.userId, oldPermissions, shopId);
    }
    // Repopulate. To ensure no lost role/permissions after removing effecting updated group change
    // Grab all permissions for the groups that user belongs to, and re-add
    let combinedPermissions = [];
    const userGroupsInShop = _.find(user.groups, { shopId });
    userGroupsInShop.names.map(name => {
      const permissions = getGroupPermissions(shop.groups, name);
      combinedPermissions = _.uniq(combinedPermissions.concat(permissions));
    });
    Meteor.call("accounts/addUserPermissions", user.userId, combinedPermissions, shopId);
  });
}

function getGroupPermissions(groups, name) {
  return _.get(_.find(groups, { name }), "permissions", []);
}
