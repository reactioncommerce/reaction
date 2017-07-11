import { check, Match } from "meteor/check";
import { Groups } from "/lib/collections";
import { Logger } from "/server/api";

/**
 * Add roles to the default groups for shops
 * Options:
 * allShops: add supplied roles to all shops, defaults to false
 * roles: Array of roles to add to default roles set
 * shops: Array of shopIds that should be added to set
 * groups: Groups to add roles to, Options: ["guest", "customer", "owner"]
 * @param {Object} options - See above for details
 * @returns {Number} result of Shops.update method (number of documents updated)
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

  return Groups.update(query, { $addToSet: { permissions: { $each: roles } } }, multi);
}
