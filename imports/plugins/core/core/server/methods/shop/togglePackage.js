import { check } from "meteor/check";
import { Reaction } from "/lib/api";
import ReactionError from "@reactioncommerce/reaction-error";
import { Packages } from "/lib/collections";

/**
 * @name shop/togglePackage
 * @method
 * @memberof Shop/Methods
 * @summary enable/disable Reaction package
 * @param {String} packageId - package _id
 * @param {Boolean} enabled - current package `enabled` state
 * @returns {Number} mongo update result
 */
export default function togglePackage(packageId, enabled) {
  check(packageId, String);
  check(enabled, Boolean);

  const shopId = Reaction.getShopId();
  if (!Reaction.hasPermission(["owner", "admin"], Reaction.getUserId(), shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  return Packages.update({
    _id: packageId,
    shopId
  }, {
    $set: {
      enabled: !enabled
    }
  });
}
