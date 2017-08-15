import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import _ from "lodash";
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

    const defaultCustomerGroupForShop = Groups.findOne({ slug: "customer", shopId }) || {};
    const defaultAdminPermissions = (defaultCustomerGroupForShop.permissions || []).concat("dashboard");
    const newGroupData = Object.assign({}, groupData, {
      slug: getSlug(groupData.name), shopId
    });

    if (!newGroupData.permissions) {
      newGroupData.permissions = [];
    }

    newGroupData.permissions = _.uniq([...newGroupData.permissions, ...defaultAdminPermissions]);

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
   * slug remains untouched; used as key in querying
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
    const update = newGroupData;
    delete update.slug; // slug remains constant because it's used as key in querying. So we remove it if it was passed

    const group = Groups.findOne({ _id: groupId }) || {};

    // prevent edits on owner. Owner groups is the default containing all roles, and as such should be untouched
    if (group.slug === "owner") {
      throw new Meteor.Error(400, "Invalid request");
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
   * (NB: At this time, a user only belongs to only one group per shop)
   * @param {String} userId - current data of the group to be updated
   * @param {String} groupId - id of the group
   * @return {Object} - object.status of 200 on success or Error object on failure
   */
  "group/addUser": function (userId, groupId) {
    check(userId, String);
    check(groupId, String);
    const group = Groups.findOne({ _id: groupId }) || {};
    const { permissions, shopId, slug } = group;
    const loggedInUserId = Meteor.userId();
    const canInvite = Reaction.canInviteToGroup({ group, user: Meteor.user() });

    // Owners can invite to any group.
    if (!Reaction.hasPermission("owner", loggedInUserId, shopId)) {
      // Admins can invite to only groups they belong
      if (!canInvite) {
        throw new Meteor.Error(403, "Access Denied");
      }
    }

    if (slug === "owner") {
      // if adding a user to the owner group, check that the request is done by current owner
      if (!Reaction.hasPermission("owner", Meteor.userId(), shopId)) {
        throw new Meteor.Error(403, "Access Denied");
      }
    }

    // make sure user only belongs to one group per shop
    const allGroupsInShop = Groups.find({ shopId }).fetch().map((grp) => grp._id);
    const user = Accounts.findOne({ _id: userId }) || {};
    const currentUserGroups = user.groups || [];
    let newGroups = [];
    let currentUserGrpInShop;
    currentUserGroups.forEach((grp) => {
      if (allGroupsInShop.indexOf(grp) < 0) {
        newGroups.push(grp);
      } else {
        currentUserGrpInShop = grp;
      }
    });
    newGroups = newGroups.concat(groupId);

    try {
      setUserPermissions({ _id: userId }, permissions, shopId);
      Accounts.update({ _id: userId }, { $set: { groups: newGroups } });

      if (slug === "owner") {
        if (shopId === Reaction.getPrimaryShopId()) {
          changeMarketplaceOwner({ userId, permissions });
        }
        // remove current shop owner after setting another admin as the new owner
        Meteor.call("group/addUser", Meteor.userId(), currentUserGrpInShop);
      }

      return { status: 200 };
    } catch (error) {
      Logger.error(error);
      throw new Meteor.Error(500, "Could not add user");
    }
  },

  /**
   * group/removeUser
   * @summary removes a user from a group for a shop, and adds them to the default customer group.
   * It updates the user's permission list to reflect. (NB: At this time, a user only belongs to only one group per shop)
   * @param {String} userId - current data of the group to be updated
   * @param {String} groupId - name of the group
   * @return {Object} - object.status of 200 on success or Error object on failure
   */
  "group/removeUser": function (userId, groupId) {
    check(userId, String);
    check(groupId, String);

    const user = Accounts.findOne({ _id: userId });
    const { shopId } = Groups.findOne({ _id: groupId }) || {};
    const defaultCustomerGroupForShop = Groups.findOne({ slug: "customer", shopId }) || {};

    if (!Reaction.hasPermission("admin", Meteor.userId(), shopId)) {
      throw new Meteor.Error(403, "Access Denied");
    }

    if (!user) {
      throw new Meteor.Error(404, "Could not find user");
    }

    try {
      setUserPermissions(user, defaultCustomerGroupForShop.permissions, shopId);
      Accounts.update({ _id: userId, groups: groupId }, { $set: { "groups.$": defaultCustomerGroupForShop._id } }); // replace the old id with new id
      return { status: 200 };
    } catch (error) {
      Logger.error(error);
      throw new Meteor.Error(500, "Could not add user");
    }
  }
});

/**
 * changeMarketplaceOwner
 * @summary checks if the user making the request is allowed to make invitation to that group
 * @param {Object} options -
 * @param {String} options.userId - userID
 * @param {String} options.permissions - permissions
 * @return {null} -
 */
function changeMarketplaceOwner({ userId, permissions }) {
  // give global marketplace role to new owner
  Roles.setUserRoles(userId, permissions, Roles.GLOBAL_GROUP);
  // remove global from previous owner
  Meteor.users.update({ _id: Meteor.userId() }, { $unset: { [`roles.${Roles.GLOBAL_GROUP}`]: "" } });
}

function setUserPermissions(users, permissions, shopId) {
  let affectedUsers = users;
  if (!Array.isArray(users)) {
    affectedUsers = [users];
  }

  return affectedUsers.forEach((user) => Roles.setUserRoles(user._id, permissions, shopId));
}

// set default admin user's account as "owner"
Hooks.Events.add("afterCreateDefaultAdminUser", (user) => {
  const group = Groups.findOne({ slug: "owner", shopId: Reaction.getShopId() });
  Accounts.update({ _id: user._id  }, { $set: { groups: [group._id] } });
});
