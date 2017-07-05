import _ from "lodash";
import { check, Match } from "meteor/check";
import { Groups } from "/lib/collections";
import { Logger } from "/server/api";


/**
 * Add roles to the Shops default groups
 * Options:
 * allShops: add supplied roles to all shops, defaults to false
 * roles: Array of roles to add to default roles set
 * shops: Array of shopIds that should be added to set
 * roleSets: Rolesets to add roles to, Options: ["defaultRoles", "defaultVisitorRole", "defaultSellerRoles"]
 * defaultRoles goes into the Customer group
 * defaultVisitorRole goes into the Guest group. ?? Why did we not pluralize this as defaultVisitorRoles?
 * defaultSellerRoles goes into ???
 * TODO: Review and eliminate rolesets other than "default"
 * @param {Object} options - See above for details
 * @returns {Number} result of Shops.update method (number of documents updated)
 */
export function addRolesToDefaultRoleSet(options = { allShops: false, roles: [], shops: [], roleSets: ["defaultRoles"] }) {
  check(options.roles, [String]);
  check(options.allShops, Match.Maybe(Boolean));
  check(options.shops, Match.Maybe([String]));
  check(options.roleSets, Match.Maybe([String]));

  const { allShops, roles, shops, roleSets } = options;
  const query = {};
  const multi = { multi: true };
  let groupRolesSets = [];
  groupRolesSets = [...groupRolesSets, _.includes(roleSets, "defaultVisitorRole") && "guest"];
  groupRolesSets = [...groupRolesSets, _.includes(roleSets, "defaultRoles") && "customer"];
  query.slug = { $in: groupRolesSets };

  if (!allShops) {
    // if we're not updating for all shops, we should only update for the shops passed in.
    query.shopId = {
      $in: shops || []
    };
  }

  if (allShops) {
    Logger.debug(`Adding Roles: ${roles} to Group: ${groupRolesSets} for all shop groups`);
  } else {
    Logger.debug(`Adding Roles: ${roles} to Group: ${groupRolesSets} for shops: ${shops}`);
  }

  return Groups.update(query, { $addToSet: { permissions: { $each: roles } } }, multi);
}
