import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { HTTP } from "meteor/http";
import { GeoCoder, Logger } from "/server/api";
import { Reaction } from "/lib/api";
import * as Collections from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";

/**
 * Reaction Group Permission Methods
 */
Meteor.methods({
  /**
   * group/createGroup
   * @summary creates a new permission group for a shop
   * creates permission group for a given shop with passed in roles
   * @param {Object} groupData - info about group to create
   * @param {String} groupData.groupName - name of the group to be created
   * @param {Array} groupData.permissions - permissions to assign to the group being created
   * @param {String} shopId -
   * @return {null} no return value
   */
  "group/createGroup": function (groupData, shopId) {
    check(groupData, Object);
    check(shopId, String);

    // must have core permissions
    if (!Reaction.hasPermission("core")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    // {
    //   permissions: [],
    //   groupName: "groupname"
    // }

    // check params
    // check permission of user performing the action
    // add group and it's permissions on shop document
  }
});

