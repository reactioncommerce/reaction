import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Groups, Shops, Accounts } from "/lib/collections";
import { Logger } from "/server/api";

/**
 * Private method which should only be called by addRolesToGroups to keep users in sync with updated groups
 * @private
 * @method addRolesToUsersInGroups
 * @param  {object} options object that contains the query selector for groups and roles to add to users
 * @returns {number} count of all update operations performed
 */
function addRolesToUsersInGroups(options) {
  const { query, roles } = options;
  const groupsToUpdate = Groups.find(query);

  // We need a list of groups => shops to determine which users get which updates
  const groupAndShopIds = groupsToUpdate.map((group) => {
    return {
      id: group._id,
      shopId: group.shopId
    };
  });

  // We perform one update for each groupId and return a count of the number of updates performed
  return groupAndShopIds.reduce((updates, group) => {
    // Find all accounts with this group
    const accounts = Accounts.find({ groups: group.id });
    // Get a list of all userIds in those accounts
    const userIds = accounts.map((account) => account._id);
    // We're going to update all users with an _id that matched
    const selector = { _id: { $in: userIds } };

    // Build our update operation - add new roles to set for the shop associated with this group.
    const operation = {};
    operation.$addToSet = {};
    operation.$addToSet[group.shopId] = { $each: roles };

    // Run the update and store the result
    const countOfUpdatedUsers = Meteor.users.update(selector, operation, { multi: true });

    // Sum with the running total of all updates performed
    // Note that we're counting total updates, not unique users updated.
    // Any user in multiple groups will get counted multiple times.
    return updates + countOfUpdatedUsers;
  }, 0);
}

/**
 * Add roles to the default groups for shops and adds roles added to the default groups
 * to any users who are in those groups for the appropriate shops.
 * Options:
 * allShops: add supplied roles to all shops, defaults to false
 * roles: Array of roles to add to default roles set
 * shops: Array of shopIds that should be added to set
 * groups: Groups to add roles to, Options: ["guest", "customer", "owner"]
 * @param {Object} options - See above for details
 * @returns {Number} result of Shops.update method (number of documents updated)
 */
export function addRolesToGroups(options = { allShops: false, roles: [], shopIds: [], groups: ["guest"] }) {
  check(options.roles, [String]);
  check(options.allShops, Match.Maybe(Boolean));
  check(options.shopsIds, Match.Maybe([String]));
  check(options.groups, Match.Maybe([String]));

  const { allShops, roles, groups } = options;

  const { shopIds } = options; // we'll reassign shopIds if we are using all shops
  const query = {
    slug: {
      $in: groups
    }
  };
  const multi = { multi: true };

  // We need this for updating users roles

  if (!allShops) {
    // if we're not updating for all shops, we should only update for the shops passed in.
    query.shopId = { $in: shopIds || [] };

    Logger.debug(`Adding Roles: ${roles} to Groups: ${groups} for shops: ${shopIds}`);
  } else {
    Logger.debug(`Adding Roles: ${roles} to Groups: ${groups} for all shops`);
  }

  const groupsUpdated = Groups.update(query, { $addToSet: { permissions: { $each: roles } } }, multi);
  const usersUpdated = addRolesToUsersInGroups({ roles, query });

  // Return the count of groups and users updated;
  return { groupsUpdated, usersUpdated };
}
