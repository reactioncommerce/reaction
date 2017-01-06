import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Packages } from "/lib/collections";
import { Reaction } from "/server/api";
import { mergeDeep } from "/lib/api";

export const methods = {
  "registry/update": function (packageId, name, fields) {
    check(packageId, String);
    check(name, String);
    check(fields, Array);
    // settings use just the last name from full name so that schemas don't need to define overly complex names based with
    // x/x/x formatting.
    // TODO name could be optional, just use package name as default
    const setting = name.split("/").splice(-1);
    let dataToSave = {};
    dataToSave[setting] = {};
    const currentPackage = Packages.findOne(packageId);

    _.each(fields, function (field) {
      dataToSave[setting][field.property] = field.value;
    });

    if (currentPackage && currentPackage.settings) {
      dataToSave = mergeDeep(currentPackage.settings, dataToSave);
    }
    // user must have permission to package to update settings
    if (Reaction.hasPermission([currentPackage.name])) {
      return Packages.upsert({
        _id: packageId,
        name: currentPackage.name,
        enabled: currentPackage.enabled
      }, {
        $set: {
          settings: dataToSave
        }
      }, { upsert: true });
    }

    return false;
  }
};

Meteor.methods(methods);
