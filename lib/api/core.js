import { Meteor } from "meteor/meteor";
import { Shops, SellerShops } from "/lib/collections";

// Export Reaction using commonJS style for common libraries to use Reaction easily
// https://docs.meteor.com/packages/modules.html#CommonJS
let Core;

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

/**
 * getSellerShopId
 * @summary Get a seller's shopId or default to parent shopId
 * @param {userId} userId - An optional userId to find a shop for
 * @returns {String} - The shopId belonging to userId, or loggedIn seller, or the parent shopId
 */
function getSellerShopId(userId) {
  let sellerId = userId;

  if (Meteor.isClient && !sellerId) {
    sellerId = Meteor.userId();
  }

  if (sellerId) {
    const group = Roles.getGroupsForUser(sellerId, "admin")[0];
    if (group) {
      return group;
    }
  }

  return Reaction.getShopId();
}

/**
 * getSellerShop
 * @summary Get a seller's shop or default to parent shop
 * @param {userId} userId - An optional userId to find a shop for
 * @returns {String} - The shop hash belonging to userId, or loggedIn seller, or the parent shop
 */
function getSellerShop(userId) {
  const _id = getSellerShopId(userId);

  if (Meteor.isClient) {
    return SellerShops.findOne({ _id });
  }

  return Shops.findOne({ _id });
}

/**
 * hasMarketplaceAccess
 * @summary Checks if the current user has access to the marketplace based on role(s),
 *          when the Marketplace module is enabled and with guest access on
 * @role {String,Array} The role(s) to check for access
 * @returns {Boolean} True if current user if the user has access
 */
function hasMarketplaceAccess(role = "admin") {
  const currentUser = Meteor.user();
  const packageSettings = this.getPackageSettings("reaction-marketplace");

  if(!packageSettings) {
    return false;
  }

  return (
    packageSettings.enabled &&
    packageSettings.settings.public.allowGuestSellers &&
    Roles.userIsInRole(currentUser, role, this.getSellerShopId())
  );
}

const Reaction = Object.assign(Core.Reaction, {
  isPackageEnabled,
  getSellerShopId,
  getSellerShop,
  hasMarketplaceAccess
});

export {
  Reaction
};
