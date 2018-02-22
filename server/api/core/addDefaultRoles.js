import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Accounts, Groups, Shops } from "/lib/collections";
import { Logger } from "/server/api";

/**
 * Private method which should only be called by addRolesToGroups to keep users in sync with updated groups
 * @private
 * @method addRolesToUsersInGroups
 * @param  {object} options object that contains the query selector for groups and roles to add to users
 * @returns {void}
 */
function addRolesToUsersInGroups(options) {
  const { query, roles } = { ...options };

  if (!query.shopId) {
    const shops = Shops.find({}).fetch();
    const shopIds = shops.map((shop) => shop._id);
    query.shopId = {
      $in: shopIds
    };
  }

  const groupsToUpdate = Groups.find(query, { fields: { _id: 1, shopId: 1 } }).fetch();
  // We need a list of groups => shops to determine which users get which updates
  const groupAndShopIds = groupsToUpdate.map((group) => ({
    id: group._id,
    shopId: group.shopId
  }));

  // We perform one update for each groupId and return a count of the number of updates performed
  groupAndShopIds.forEach((group) => {
    // Find all accounts with this group
    const accounts = Accounts.find({ groups: group.id }, { fields: { _id: 1 } }).fetch();
    // Get a list of all userIds in those accounts
    const userIds = accounts.map((account) => account._id);
    // We're going to update all users with an _id that matched
    const selector = { _id: { $in: userIds } };

    // Build our update operation - add new roles to set for the shop associated with this group.
    const operation = {
      $addToSet: {
        [`roles.${group.shopId}`]: {
          $each: roles
        }
      }
    };

    // Update users
    Meteor.users.update(selector, operation, { multi: true });
  });
}

/**
 * @name addRolesToGroups
 * @method
 * @memberof Core
 * @summary Add roles to the default groups for shops and updates any users that are in
 * those permission groups
 * Options:
 * allShops: add supplied roles to all shops, defaults to false
 * roles: Array of roles to add to default roles set
 * shops: Array of shopIds that should be added to set
 * groups: Groups to add roles to, Options: ["guest", "customer", "owner"]
 * @param {Object} options - See above for details
 * @returns {Number} result of Groups.update method (number of documents updated)
 */
export function addRolesToGroups(options = { allShops: false, roles: [], shops: [], groups: ["guest"] }) {
  check(options.roles, [String]);
  check(options.allShops, Match.Maybe(Boolean));
  check(options.shops, Match.Maybe([String]));
  check(options.groups, Match.Maybe([String]));

  const { allShops, roles, shops, groups } = options;
  const query = {
    slug: {
      $in: groups
    }
  };
  const multi = { multi: true };

  if (!allShops) {
    // if we're not updating for all shops, we should only update for the shops passed in.
    query.shopId = { $in: shops || [] };
    Logger.debug(`Adding Roles: ${roles} to Groups: ${groups} for shops: ${shops}`);
  } else {
    Logger.debug(`Adding Roles: ${roles} to Groups: ${groups} for all shops`);
  }

  addRolesToUsersInGroups({ query, roles });

  return Groups.update(query, { $addToSet: { permissions: { $each: roles } } }, multi);
}
