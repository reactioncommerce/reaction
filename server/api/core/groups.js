import _ from "lodash";
import { Roles } from "meteor/alanning:roles";
import { Logger, Reaction } from "/server/api";
import { Shops, Groups } from "/lib/collections";

/**
 * @name createGroups
 * @method
 * @memberof Core
 * @summary creates groups for shops
 * @param {object} options -
 * @param {string} options.shopId - the id of shop to create the group for. Not passing a shopId creates
 * the group(s) for all available shops
 * @param {object} options.roles - key-value pair representing the group slug (key) and
 * array of roles for the group (value)
 * @return {null}
 */
export function createGroups(options = {}) {
  const { shopId } = options;
  let { roles } = options;
  const allGroups = Groups.find({}).fetch();
  const query = {};

  if (!roles) {
    roles = getDefaultGroupRoles();
  }

  if (shopId) {
    query._id = shopId;
  }

  const shops = Shops.find(query).fetch();

  if (shops && shops.length) {
    shops.forEach((shop) => createGroupsForShop(shop));
  }
  function createGroupsForShop(shop) {
    Object.keys(roles).forEach((groupKey) => {
      const groupExists = allGroups.find((grp) => grp.slug === groupKey && grp.shopId === shop._id);
      if (!groupExists) { // create group only if it doesn't exist before
        // get roles from the default groups of the primary shop; we try to use this first before using default roles
        const primaryShopGroup = allGroups.find((grp) => grp.slug === groupKey && grp.shopId === Reaction.getPrimaryShopId());
        Logger.debug(`creating group ${groupKey} for shop ${shop.name}`);
        Groups.insert({
          name: groupKey,
          slug: groupKey,
          permissions: (primaryShopGroup && primaryShopGroup.permissions) || roles[groupKey],
          shopId: shop._id
        });
      }
    });
  }
}

/**
 * @method getDefaultGroupRoles
 * @private
 * @method
 * @memberof Core
 * @summary Generates default groups: Get all defined roles from the DB except "anonymous"
 * because that gets removed from a user on register if it's not removed,
 * it causes mismatch between roles in user (i.e Meteor.user().roles[shopId]) vs that in
 * the user's group (Group.find(usergroup).permissions)
 * @return {object} roles - object key-value pair containing the default groups and roles for the groups
 */
function getDefaultGroupRoles() {
  let ownerRoles = Roles
    .getAllRoles().fetch()
    .map((role) => role.name)
    .filter((role) => role !== "anonymous"); // see comment above

  // Join all other roles with package roles for owner. Owner should have all roles
  // this is needed because of default roles defined in the app that are not in Roles.getAllRoles
  ownerRoles = ownerRoles.concat(Reaction.defaultCustomerRoles);
  ownerRoles = _.uniq(ownerRoles);

  // we're making a Shop Manager default group that have all roles except the owner role
  const shopManagerRoles = ownerRoles.filter((role) => role !== "owner" && role !== "admin");
  shopManagerRoles.push("shopSettings");

  const roles = {
    "shop manager": shopManagerRoles,
    "customer": Reaction.defaultCustomerRoles,
    "guest": Reaction.defaultVisitorRoles,
    "owner": ownerRoles
  };

  return roles;
}
