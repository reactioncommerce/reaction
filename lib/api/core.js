import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Accounts, Shops, SellerShops } from "/lib/collections";

let Core;

// TODO: Decide how we want to approach this problem - duplicate content on both client
// and server, or detecting client/server and DRYing up the code.
if (Meteor.isServer) {
  Core = require("/server/api");
} else {
  Core = require("/client/api");
}

/**
 * @method isPackageEnabled
 * @memberof Core
 * @summary Check if package is enabled
 * @example Reaction.isPackageEnabled()
 * @param  {String}  name - Package name
 * @return {Boolean}      True if the package is enabled
 */
function isPackageEnabled(name) {
  const settings = this.getPackageSettings(name);

  return !!settings.enabled;
}

/**
 * @method getSeller
 * @memberof Core
 * @example Reaction.getSeller(shopId)
 * @param  {String} shopId ID of shop
 * @return {Object}        Account object of seller
 */
function getSeller(shopId) {
  let sellerShopId;

  if (!shopId) {
    const currentUser = Meteor.user();
    if (currentUser) {
      [sellerShopId] = Roles.getGroupsForUser(currentUser.id, "admin");
    }
  } else {
    sellerShopId = shopId;
  }

  return Accounts.findOne({ shopId: sellerShopId });
}

/**
 * @method getSellerShopId
 * @memberof Core
 * @summary Get a seller's shopId or default to parent shopId
 * @example Reaction.getSellerShopId(this.userId, true)
 * @param {String|Object} user - An optional user hash or userId to find a shop for
 * @param {Boolean} [noFallback=false] - Optional.If set to true doesn't fallback to owner shopId
 * when user doesn't have a shop.
 * @returns {String|Boolean} - The shopId belonging to userId, or loggedIn seller, or the parent shopId
 */
function getSellerShopId(user, noFallback = false) {
  let seller = user;

  if (Meteor.isClient && !seller) {
    seller = Meteor.user();
  }

  if (seller) {
    const group = Roles.getGroupsForUser(seller, "admin")[0];
    if (group) {
      return group;
    }
  }


  if (noFallback) {
    return false;
  }

  return Core.Reaction.getShopId();
}

/**
 * @method getSellerShop
 * @memberof Core
 * @summary Get a seller's shop or default to parent shop
 * @param {String|Object} user - An optional user hash or userId to find a shop for
 * @param {Boolean} [noFallback=false] - Optional.If set to true doesn't fallback to owner shop
 * when user doesn't have a shop.
 * @returns {String|Boolean} - The shop hash belonging to userId, or loggedIn seller, or the parent shop
 */
function getSellerShop(user, noFallback = false) {
  const _id = getSellerShopId(user, noFallback);

  if (!_id) {
    return false;
  }

  if (Meteor.isClient && _id !== Core.Reaction.getShopId()) {
    return SellerShops.findOne({ _id });
  }

  return Shops.findOne({ _id });
}

/**
  * getShopsForUser -
  * @summary gets shopIds of shops where user has provided permissions
  * @param {Array} roles - roles to check if user has
  * @param {Object} userId - userId to check permissions for (defaults to current user)
  * @return {Array} - shopIds user has provided permissions for
  */
function getShopsForUser(roles, userId = Meteor.userId()) {
  // Get full user object, and get shopIds of all shops they are attached to
  const user = Meteor.user(userId);
  if (!user || !user.roles) {
    return [];
  }
  const shopIds = Object.keys(user.roles);
  // Remove "__global_roles__" from the list of shopIds, as this function will always return true for
  // marketplace admins if that "id" is left in the check
  const filteredShopIds = shopIds.filter((shopId) => shopId !== "__global_roles__");

  // Reduce shopIds to shopsWithPermission, using the roles passed in to this function
  const shopIdsWithRoles = filteredShopIds.reduce((shopsWithPermission, shopId) => {
    // Get list of roles user has for this shop
    const rolesUserHas = user.roles[shopId];

    // Find first role that is included in the passed in roles array, otherwise hasRole is undefined
    const hasRole = rolesUserHas.find((roleUserHas) => roles.includes(roleUserHas));

    // if we found the role, then the user has permission for this shop. Add shopId to shopsWithPermission array
    if (hasRole) {
      shopsWithPermission.push(shopId);
    }
    return shopsWithPermission;
  }, []);

  return shopIdsWithRoles;
}

const Reaction = Object.assign(Core.Reaction, {
  isPackageEnabled,
  getSeller,
  getSellerShopId,
  getSellerShop,
  getShopsForUser
});

export { Reaction };
