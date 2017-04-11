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
 * @param {Boolean} [noFallback=false] - Optional.If set to true doesn't fallback to owner shopId
 * when user doesn't have a shop.
 * @returns {String|Boolean} - The shopId belonging to userId, or loggedIn seller, or the parent shopId
 */
function getSellerShopId(userId, noFallback = false) {
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

  if (noFallback) {
    return false;
  }

  return Reaction.getShopId();
}

/**
 * getSellerShop
 * @summary Get a seller's shop or default to parent shop
 * @param {userId} userId - An optional userId to find a shop for
 * @param {Boolean} [noFallback=false] - Optional.If set to true doesn't fallback to owner shop
 * when user doesn't have a shop.
 * @returns {String|Boolean} - The shop hash belonging to userId, or loggedIn seller, or the parent shop
 */
function getSellerShop(userId, noFallback = false) {
  const _id = getSellerShopId(userId, noFallback);

  if (!_id) {
    return false;
  }

  if (Meteor.isClient && _id !== Reaction.getShopId()) {
    return SellerShops.findOne({ _id });
  }

  return Shops.findOne({ _id });
}

/**
 * hasMarketplaceGuestAccess
 * @summary Checks if the current user is a guest in the marketplace and not a seller
 * @returns {Boolean} True if current user is a guest and not a seller
 */
function hasMarketplaceGuestAccess() {
  const currentUser = Meteor.user();

  const packageSettings = Reaction.getPackageSettings("reaction-marketplace");

  // if marketplace is on
  // allow only guests, who aren't sellers already
  // to become sellers for their shop group
  return (
    packageSettings.enabled &&
    packageSettings.settings.public.allowGuestSellers &&
    Roles.getGroupsForUser(currentUser, "admin").length < 1
  );
}

const Reaction = Object.assign(Core.Reaction, {
  isPackageEnabled,
  getSellerShopId,
  getSellerShop,
  hasMarketplaceGuestAccess
});

export {
  Reaction
};
