import ReactionError from "@reactioncommerce/reaction-error";
import { check } from "meteor/check";
import { Packages } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { mergeDeep } from "/lib/api";

/**
 * @name registry/update
 * @method
 * @memberof Registry/Methods
 * @example Meteor.call("registry/update", packageId, settingsKey, fields)
 * @param  {String} packageId ID of package
 * @param  {String} name      Name of package
 * @param  {Array} fields     Fields to update
 * @todo Name could be optional. Just use package name as default.
 * @returns {Boolean}          true on success, false on error
 */
export default function updateRegistry(packageId, name, fields) {
  check(packageId, String);
  check(name, String);
  check(fields, Array);

  const shopId = Reaction.getShopId();

  // settings use just the last name from full name so that schemas don't need to define overly complex names based with
  // x/x/x formatting.
  // TODO Name could be optional. Just use package name as default
  const setting = name.split("/").splice(-1);

  let dataToSave = {};
  dataToSave[setting] = {};

  fields.forEach((field) => {
    dataToSave[setting][field.property] = field.value;
  });

  const currentPackage = Packages.findOne({ _id: packageId, shopId });
  if (currentPackage && currentPackage.settings) {
    dataToSave = mergeDeep(currentPackage.settings, dataToSave);
  }

  // user must have permission to package to update settings
  if (!Reaction.hasPermission([name], Reaction.getUserId(), shopId)) {
    throw new ReactionError("access-denied", "Access denied");
  }

  return Packages.upsert({
    _id: packageId,
    shopId
  }, {
    $set: {
      settings: dataToSave
    },
    $setOnInsert: {
      enabled: true,
      name: currentPackage ? currentPackage.name : null
    }
  }, { upsert: true });
}
