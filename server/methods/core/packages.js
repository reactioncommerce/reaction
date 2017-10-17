import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Packages } from "/lib/collections";
import { Reaction } from "/server/api";

export const methods = {
  "package/update": function (packageName, field, value) {
    check(packageName, String);
    check(field, String);
    check(value, Object);

    if (!Reaction.hasPermission([packageName])) {
      throw new Meteor.Error(403, `Access Denied. You don't have permissions for the ${packageName} package.`);
    }

    return Packages.update({
      name: packageName,
      shopId: Reaction.getShopId()
    }, {
      $set: {
        [field]: value
      }
    });
  }
};

Meteor.methods(methods);
