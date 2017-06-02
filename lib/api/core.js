import { Meteor } from "meteor/meteor";
import { Accounts, Shops, SellerShops } from "/lib/collections";

// Export Reaction using commonJS style for common libraries to use Reaction easily
// https://docs.meteor.com/packages/modules.html#CommonJS
let Core;
// TODO: Decide how we want to approach this problem - duplicate content on both client
// and server, or detecting client/server and DRYing up the code.
if (Meteor.isServer) {
  Core = require("/server/api");
} else {
  Core = require("/client/api");
}

/**
 * Check if package is enabled
 * @param  {String}  name - Package name
 * @return {Boolean}      True if the package is enabled
 */
function isPackageEnabled(name) {
  const settings = this.getPackageSettings(name);

  return !!settings.enabled;
}


function getSeller(shopId) {
  let sellerShopId;

  if (!shopId) {
    const currentUser = Meteor.user();
    if (currentUser) {
      sellerShopId = Roles.getGroupsForUser(currentUser.id, "admin")[0];
    }
  } else {
    sellerShopId = shopId;
  }

  return Accounts.findOne({ shopId: sellerShopId });
}


/**
 * getSellerShopId
 * @summary Get a seller's shopId or default to parent shopId
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
 * getSellerShop
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
 * hasMarketplaceAccess
 * @summary Checks if the current user has access to the marketplace based on role(s),
 *          when the Marketplace module is enabled and with guest access on
 * @param {String|Array} role The role(s) to check for access
 * @returns {Boolean} True if current user has access
 */
function hasMarketplaceAccess(role = "admin") {
  const currentUser = Meteor.user();
  const packageSettings = Core.Reaction.getPackageSettings("reaction-marketplace");

  return (
    packageSettings &&
    packageSettings.enabled &&
    packageSettings.settings.public.allowGuestSellers &&
    Roles.userIsInRole(currentUser, role, this.getSellerShopId())
  );
}

const Reaction = Object.assign(Core.Reaction, {
  isPackageEnabled,
  getSeller,
  getSellerShopId,
  getSellerShop,
  hasMarketplaceAccess
});

export {
  Reaction
};
