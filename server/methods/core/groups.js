import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import _ from "lodash";
import { Roles } from "meteor/alanning:roles";
import { Reaction, Logger, Hooks } from "/server/api";
import { Accounts, Groups } from "/lib/collections";
import { getSlug } from "/lib/api";

/**
 * @file Methods for creating and managing admin user permission groups.
 * Run these methods using `Meteor.call()`.
 * @example Meteor.call("group/createGroup", sampleCustomerGroup, shop._id)
 * @namespace Methods/Group
*/
Meteor.methods({
  /**
   * @name group/createGroup
   * @method
   * @memberof Methods/Group
   * @summary Creates a new permission group for a shop
   * It creates permission group for a given shop with passed in roles
   * @param {Object} groupData - info about group to create
   * @param {String} groupData.name - name of the group to be created
   * @param {String} groupData.description - Optional description of the group to be created
   * @param {Array} groupData.permissions - permissions to assign to the group being created
   * @param {String} shopId - id of the shop the group belongs to
   * @return {Object} - `object.status` of 200 on success or Error object on failure
   */
  "group/createGroup"(groupData, shopId) {
    check(groupData, Object);
    check(groupData.name, String);
    check(groupData.description, Match.Optional(String));
    check(groupData.permissions, Match.Optional([String]));
    check(shopId, String);
    let _id;

    // we are limiting group method actions to only users with admin roles
    // this also include shop owners, since they have the `admin` role in their Roles.GLOBAL_GROUP
    if (!Reaction.hasPermission("admin", Meteor.userId(), shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
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
      throw new Meteor.Error("conflict", "Group already exist for this shop");
    }
    try {
      _id = Groups.insert(newGroupData);
    } catch (error) {
      Logger.error(error);
      throw new Meteor.Error("invalid-parameter", "Bad request");
    }

    return { status: 200, group: Groups.findOne({ _id }) };
  },

  /**
   * @name group/updateGroup
   * @method
   * @memberof Methods/Group
   * @summary Updates a permission group for a shop.
   * Change the details of a group (name, desc, permissions etc) to the values passed in.
   * It also goes into affected user data to modify both the groupName (using Accounts schema)
   * and group permissions (using "accounts/removeUserPermissions")
   * @param {Object} groupId - group to be updated
   * @param {Object} newGroupData - updated group info (similar to current group data)
   * slug remains untouched; used as key in querying
   * @param {String} shopId - id of the shop the group belongs to
   * @return {Object} - `object.status` of 200 on success or Error object on failure
   */
  "group/updateGroup"(groupId, newGroupData, shopId) {
    check(groupId, String);
    check(newGroupData, Object);
    check(shopId, String);

    // we are limiting group method actions to only users with admin roles
    // this also include shop owners, since they have the `admin` role in their Roles.GLOBAL_GROUP
    if (!Reaction.hasPermission("admin", Meteor.userId(), shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    // 1. Update the group data
    const update = newGroupData;
    delete update.slug; // slug remains constant because it's used as key in querying. So we remove it if it was passed

    const group = Groups.findOne({ _id: groupId }) || {};

    // prevent edits on owner. Owner groups is the default containing all roles, and as such should be untouched
    if (group.slug === "owner") {
      throw new Meteor.Error("invalid-parameter", "Bad request");
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
    throw new Meteor.Error("server-error", "Update not successful");
  },

  /**
   * @name group/addUser
   * @method
   * @memberof Methods/Group
   * @summary Adds a user to a permission group
   * Updates the user's list of permissions/roles with the defined the list defined for the group
   * (NB: At this time, a user only belongs to only one group per shop)
   * @param {String} userId - current data of the group to be updated
   * @param {String} groupId - id of the group
   * @return {Object} - `object.status` of 200 on success or Error object on failure
   */
  "group/addUser"(userId, groupId) {
    check(userId, String);
    check(groupId, String);
    const group = Groups.findOne({ _id: groupId }) || {};
    const { permissions, shopId, slug } = group;
    const loggedInUserId = Meteor.userId();
    const canInvite = Reaction.canInviteToGroup({ group });

    // we are limiting group method actions to only users with admin roles
    // this also include shop owners, since they have the `admin` role in their Roles.GLOBAL_GROUP
    if (!Reaction.hasPermission("admin", loggedInUserId, shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    // Users with `owner` and/or `admin` roles can invite to any group
    // Also a user with `admin` can invite to only groups they have permissions that are a superset of
    // See details of canInvite method in core (i.e Reaction.canInviteToGroup)
    if (!canInvite) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    if (slug === "owner") {
      // if adding a user to the owner group, check that the request is done by current owner
      if (!Reaction.hasPermission("owner", Meteor.userId(), shopId)) {
        throw new Meteor.Error("access-denied", "Access Denied");
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
      Hooks.Events.run("afterAccountsUpdate", loggedInUserId, {
        accountId: userId,
        updatedFields: ["groups"]
      });
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
      throw new Meteor.Error("server-error", "Could not add user");
    }
  },

  /**
   * @name group/removeUser
   * @method
   * @memberof Methods/Group
   * @summary Removes a user from a group for a shop, and adds them to the default customer group.
   * Updates the user's permission list to reflect.
   * (NB: At this time, a user only belongs to only one group per shop)
   * @param {String} userId - current data of the group to be updated
   * @param {String} groupId - name of the group
   * @return {Object} - `object.status` of 200 on success or Error object on failure
   */
  "group/removeUser"(userId, groupId) {
    check(userId, String);
    check(groupId, String);

    const user = Accounts.findOne({ _id: userId });
    const { shopId } = Groups.findOne({ _id: groupId }) || {};
    const defaultCustomerGroupForShop = Groups.findOne({ slug: "customer", shopId }) || {};

    // we are limiting group method actions to only users with admin roles
    // this also include shop owners, since they have the `admin` role in their Roles.GLOBAL_GROUP
    if (!Reaction.hasPermission("admin", Meteor.userId(), shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    if (!user) {
      throw new Meteor.Error("invalid-parameter", "Could not find user");
    }

    try {
      setUserPermissions(user, defaultCustomerGroupForShop.permissions, shopId);
      Accounts.update({ _id: userId, groups: groupId }, { $set: { "groups.$": defaultCustomerGroupForShop._id } }); // replace the old id with new id
      Hooks.Events.run("afterAccountsUpdate", Meteor.userId(), {
        accountId: userId,
        updatedFields: ["groups"]
      });
      return { status: 200 };
    } catch (error) {
      Logger.error(error);
      throw new Meteor.Error("server-error", "Could not add user");
    }
  }
});

/**
 * changeMarketplaceOwner
 * @private
 * @summary Checks if the user making the request is allowed to make invitation to that group
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

/**
 * setUserPermissions
 * @private
 * @summary Set user permissions
 * @param {Object} users -
 * @param {String} permissions -
 * @param {String} shopId -
 * @return {null} -
 */
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
  Accounts.update({ _id: user._id }, { $set: { groups: [group._id] } });
  Hooks.Events.run("afterAccountsUpdate", null, {
    accountId: user._id,
    updatedFields: ["groups"]
  });
});
