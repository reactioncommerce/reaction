import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Roles } from "meteor/alanning:roles";
import { Reaction } from "/lib/api";
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
   * @return {Object} on success returns obj with status field of 200
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
   * @return {null} -
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

    console.log({ shop });

    if (!shop) {
      throw new Meteor.Error(400, "Bad request data");
    }

    if (groupNameChanged) {
      updateAllAffectedUsersGroupName(group.name, newGroupData.name, shopId);
    }

    // if (permissionsChanged) {
    //   updateAllAffectedUsersPermissions(newGroupData, shopId);
    // }

    return { shop, status: 200 };
  }
});

function updateAllAffectedUsersGroupName(groupName, newName, shopId) {
  const matchQuery = { $elemMatch: { shopId: shopId, names: groupName } };
  const affectedUsers = Accounts.find({ groups: matchQuery }).fetch();

  console.log(JSON.stringify({ affectedUsers }, null, 4));

  affectedUsers.forEach(user => {
    user.groups = user.groups.map(group => {
      if (group.shopId === shopId) {
        group.names = replaceArrayItem(group.names, groupName, newName);
      }
      return group;
    });
    const updateQuery = { groups: user.groups };
    console.log(JSON.stringify({ user }, null, 4));
    Accounts.update({ _id: user._id }, { $set: updateQuery });
  });

  function replaceArrayItem(array, item, newItem) {
    return array.map(value => {
      if (value === item) return newItem;
      return value;
    });
  }
}

function updateAllAffectedUsersPermissions(group, shopId) {
  const shop = Shops.find({ _id: shopId });
  const affectedUsers = Accounts.find({ groups: group.name });

  affectedUsers.forEach(user => {
    Meteor.call("accounts/removeUserPermissions", user.userId, group.permissions, shopId);

    // add back all permissions belonging for all needed groups for that user
    // gather/concat all the group permissions for that user
    const allGroupRoles = [];
    user.groups[shopId].map(userGroup => allGroupRoles.push(shop.groups[userGroup]));
    // call add/permissions
    return Meteor.call("accounts/addUserPermissions", user.userId, allGroupRoles, shopId);
  });
}

// data = {name: "Consultant", permissions: ["createProduct"]}
// Meteor.call("group/createGroup", data, "J8Bhq3uTtdgwZx3rz", function (err, res) { console.log({err, res})})

