import { check, Match } from "meteor/check";
import { Shops } from "/lib/collections";
import { Logger } from "/server/api";


/**
 * Add roles to the Shops.defaultRoles array
 * Options:
 * allShops: add supplied roles to all shops, defaults to false
 * roles: Array of roles to add to default roles set
 * shops: Array of shopIds that should be added to set
 * roleSets: Rolesets to add roles to, Options: ["defaultRoles", "defaultVisitorRole", "defaultSellerRoles"]
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
  const update = {};

  if (!allShops) {
    // if we're not updating all shops, we should only update the shops passed in.
    query._id = {
      $in: shops || []
    };
  }

  roleSets.forEach((roleSet) => {
    // We should add each role to each roleSet passed in.
    update[roleSet] = { $each: roles };
  });

  if (allShops) {
    Logger.debug(`Adding roles ${roles} to roleSets  ${roleSets} for all shops`);
  } else {
    Logger.debug(`Adding roles: ${roles} to roleSets: ${roleSets} for shops: ${shops}`);
  }

  return Shops.update(query, { $addToSet: update }, { multi: true });
}
