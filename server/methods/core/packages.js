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

  const userId = Meteor.userId();
  const shopId = Reaction.getShopId();
  if (!Reaction.hasPermission([packageName], userId, shopId)) {
    throw new Meteor.Error("access-denied", `Access Denied. You don't have permissions for the ${packageName} package.`);
  }

  const updateResult = Packages.update({
    name: packageName,
    shopId
  }, {
    $set: {
      [field]: value
    }
  });
  if (updateResult !== 1) {
    throw new Meteor.Error("server-error", `An error occurred while updating the package ${packageName}.`);
  }
  return updateResult;
}

Meteor.methods({
  "package/update": updatePackage
});
