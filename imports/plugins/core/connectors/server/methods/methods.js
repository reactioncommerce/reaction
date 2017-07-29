import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Packages } from "/lib/collections";
import { Reaction } from "/server/api";
import { connectorsRoles } from "../lib/roles";

export const methods = {
  /**
   * connectors/connection/toggle
   * @summary toggle enabled connection
   * @param { String } packageId - packageId
   * @param { String } connection - connection name
   * @return { Number } update - result
   */
  "connectors/connection/toggle": function (packageId, connection) {
    check(packageId, String);
    check(connection, String);
    if (!Reaction.hasPermission(connectorsRoles)) {
      throw new Meteor.Error(403, "Access Denied");
    }
    const pkg = Packages.findOne(packageId);
    if (pkg && pkg.settings[connection]) {
      // const enabled = pkg.settings[connection].enabled;
    }
  }
};

Meteor.methods(methods);
