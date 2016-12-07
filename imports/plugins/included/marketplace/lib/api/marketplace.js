import { Meteor } from "meteor/meteor";
import { Packages } from "/lib/collections";
import { Reaction } from "/lib/api";

const name = "reaction-marketplace";

/*
No need for this anymore
Use Reaction.getPackageSettings(name) instead
export function getPackageSettings() {

  return Reaction.getPackageSettings(name)
}*/

/*
 No need for this anymore
 Use Reaction.isPackageEnabled(name) instead
export function isEnabled() {
  const packageInfo = getPackageSettings();

  if (typeof packageInfo.enabled === "boolean") {
    return packageInfo.enabled;
  }

  return false;
}*/

export function hasMarketplaceGuestAccess() {
  const currentUser = Meteor.user();

  // parent shop owners have full access
  if(Roles.getGroupsForUser(currentUser, ['owner']).length) {
    return true;
  }

  const packageSettings = Reaction.getPackageSettings('reaction-marketplace');

  // if marketplace is on
  // allow only guests, who aren't sellers already
  // to become sellers for their shop group
  return (
    packageSettings.enabled &&
    packageSettings.settings.public.allowGuestSellers &&
    Roles.getGroupsForUser(currentUser, 'admin').length < 1
  );
};

export const Marketplace = {
  hasMarketplaceGuestAccess
};
