import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Packages } from "/lib/collections";
import { Reaction } from "/server/api";

Meteor.methods({
  "registry/update": function (packageId, name, fields) {
    check(packageId, String);
    check(name, String);
    check(fields, Array);
    let dataToSave = {};
    // settings use just the last name from full name
    // so that schemas don't need to define overly complex
    // names based with x/x/x formatting.
    const setting = name.split("/").splice(-1);
    dataToSave[setting] = {};

    const currentPackage = Packages.findOne(packageId);

    _.each(fields, function (field) {
      dataToSave[setting][field.property] = field.value;
    });

    if (currentPackage && currentPackage.settings) {
      dataToSave = Object.assign({}, currentPackage.settings, dataToSave);
    }
    // user must have permission to package
    // to update settings
    if (Reaction.hasPermission([name])) {
      return Packages.upsert({
        _id: packageId,
        name: currentPackage.name,
        enabled: currentPackage.enabled
      }, {
        $set: {
          settings: dataToSave
        }
      }, {
        upsert: true
      });
    }

    return false;
  }
});
