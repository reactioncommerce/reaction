import { check, Match } from "meteor/check";
import { Packages } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @method package/update
 * @memberof Package/Methods
 * @summary updates the data stored for a certain Package.
 * @param {String} packageName - the name of the Package to update.
 * @param {String} field - the part of the Package's data that is to
 * be updated.
 * @param {Object|Array} value - the new data that's to be stored for the said
 * Package.
 * @since 1.5.1
 * @returns {Object} - returns an object with info about the update operation.
 */
export default function updatePackage(packageName, field, value) {
  check(packageName, String);
  check(field, String);
  check(value, Match.OneOf(Object, Array));

  const userId = Reaction.getUserId();
  const shopId = Reaction.getShopId();
  if (!Reaction.hasPermission([packageName], userId, shopId)) {
    throw new ReactionError("access-denied", `Access Denied. You don't have permissions for the ${packageName} package.`);
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
    throw new ReactionError("server-error", `An error occurred while updating the package ${packageName}.`);
  }
  return updateResult;
}
