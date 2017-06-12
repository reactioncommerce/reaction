import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reaction } from "/lib/api";
import { Shops } from "/lib/collections";

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
   * @param {String} groupData.groupName - name of the group to be created
   * @param {Array} groupData.permissions - permissions to assign to the group being created
   * @param {String} shopId - id of the shop the group belongs to
   * @return
   */
  "group/createGroup": function (groupData, shopId) {
    check(groupData.groupName, String);
    check(groupData.permissions, Array);
    check(shopId, String);

    // must have needed permissions.. .TODO: Review who can create a group permission for a shop
    if (!Reaction.hasPermission("owner")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const shop = Shops.update({ _id: shopId }, { $addToSet: groupData });
    console.log({ shop });
    return shop;
  },

  /**
   * group/updateGroup
   * @summary updates a permission group for a shop
   * updates either the name of the permission group or it roles list
   * @param {Object} group - current data of the group to be updated
   * @param {String} group.groupName - name of the group
   * @param {Array} group.permissions - permissions of the group
   * @param {Object} newGroupData - updated group info (similar to current group data)
   * @param {String} shopId - id of the shop the group belongs to
   * @return {null} -
   */
  "group/updateGroup": function (group, newGroupData, shopId) {
    check(group.groupName, String);
    check(group.permissions, Array);

    check(newGroupData.groupName, String);
    check(newGroupData.permissions, Array);
    check(shopId, String);

    // must have needed permissions.. .TODO: Review who can create a group permission for a shop
    if (!Reaction.hasPermission("owner")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const updateQuery = { "groups.$": newGroupData };

    const shop = Shops.update({ _id: shopId, group: group }, { $set: updateQuery });

    console.log({ shop });
    // if update successfull, check users with such group and update them

    return shop;
  }
});

