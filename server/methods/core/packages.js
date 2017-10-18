import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Packages } from "/lib/collections";
import { Reaction } from "/server/api";

/**
 * @method updatePackage
 * @summary updates the data stored for a certain Package.
 * @param {String} packageName - the name of the Package to update.
 * @param {String} field - the part of the Package's data that is to
 * be updated.
 * @param {Object} value - the new data that's to be stored for the said
 * Package.
 * @since 1.5.1
 * @return {Object} - returns an object with info about the update operation.
 */
export function updatePackage(packageName, field, value) {
  check(packageName, String);
  check(field, String);
  check(value, Object);

  if (!Reaction.hasPermission([packageName])) {
    throw new Meteor.Error(403, `Access Denied. You don't have permissions for the ${packageName} package.`);
  }

  // TODO: What if the said Package doesn't exist? Should we create it? Or
  // throw an error?

  return Packages.update({
    name: packageName,
    shopId: Reaction.getShopId()
  }, {
    $set: {
      [field]: value
    }
  });
}

Meteor.methods({
  "package/update": updatePackage
});
