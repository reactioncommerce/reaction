import { Meteor } from "meteor/meteor";
import { Reaction } from "/lib/api";

/**
 * hasMarketplaceGuestAccess
 * @summary Checks if the current user is a guest in the marketplace and not a seller
 *          Owners always have full access
 * @returns {Boolean} True if current user is a guest and not a seller, or the owner
 */
function hasMarketplaceGuestAccess() {
  const currentUser = Meteor.user();

  // parent shop owners have full access
  if (Roles.getGroupsForUser(currentUser, "owner").length) {
    return true;
  }

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

export const Marketplace = {
  hasMarketplaceGuestAccess
};
