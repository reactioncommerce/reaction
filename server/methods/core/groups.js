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
   * @return {Object} on success returns obj with "status" field of 200
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
   * updates either the name of the permission group or it roles list.
   * It also goes into affected user data to modify both the groupName (using Accounts schema)
   * and group permissions (using "accounts/removeUserPermissions")
   * @param {Object} group - current data of the group to be updated
   * @param {String} group.name - name of the group
   * @param {Array} group.permissions - permissions of the group
   * @param {Object} newGroupData - updated group info (similar to current group data)
   * @param {String} shopId - id of the shop the group belongs to
   * @return {Object} on success returns obj with "status" field of 200
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

    const shop = Shops.update({ _id: shopId, groups: group }, { $set: updateQuery });

    if (!shop) {
      throw new Meteor.Error(400, "Bad request data");
    }

    const matchQuery = { $elemMatch: { shopId: shopId, names: group.name } };
    const users = Accounts.find({ groups: matchQuery }).fetch();
    let error;

    if (groupNameChanged) {
      error = updateAllAffectedUsersGroupName(users, group.name, newGroupData.name, shopId);
    }

    if (permissionsChanged) {
      error = updateAllAffectedUsersPermissions(users, group, newGroupData, shopId);
    }

    if (!error) {
      return { shop, status: 200 };
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
   * @param {Object} groupData - name of the group
   * @param {String} shopId - permissions of the group
   * @return {Object} - object.status of 200
   */
  "group/addUser": function (userId, groupData, shopId) {
    check(userId, Object);
    check(groupData, Object);
    check(groupData.name, String);
    check(groupData.permissions, [String]);
    check(shopId, String);

    const user = Accounts.findOne({ _id: userId });
    try {
      // set the group name into that user account
      updateAllAffectedUsersGroupName([user], "", groupData.name, shopId);
      // put the permissions into the user doc
      Meteor.call("accounts/addUserPermissions", user.userId, groupData.permissions, shopId);
      return { status: 200 };
    } catch (error) {
      Logger.error(error);
      throw new Meteor.Error(500, "Could not add user");
    }
  }
});

function updateAllAffectedUsersGroupName(affectedUsers, groupName, newName, shopId) {
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

function updateAllAffectedUsersPermissions(affectedUsers, oldGroup, shopId) {
  const shop = Shops.findOne({ _id: shopId });
  const oldPermissions = oldGroup.permissions || [];
  return affectedUsers.forEach(user => {
    if (oldPermissions.length) {
      // requires "reaction-accounts" permission access
      Meteor.call("accounts/removeUserPermissions", user.userId, oldPermissions, shopId);
    }
    // Repopulate. To ensure no lost role/permissions after removing effecting updated group change
    let combinedPermissions = [];
    const userGroupsInShop = _.find(user.groups, { shopId });
    userGroupsInShop.names.map(name => {
      const permissions = _.get(_.find(shop.groups, { name }), "permissions", []);
      combinedPermissions = _.uniq(combinedPermissions.concat(permissions));
    });
    Meteor.call("accounts/addUserPermissions", user.userId, combinedPermissions, shopId);
  });
}
