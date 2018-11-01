import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { EJSON } from "meteor/ejson";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Packages } from "/lib/collections";

export const methods = {
  /**
   * @name googleWebTools/updateGoogleWebToolsSettings
   * @summary Updates Google web tools settings
   * @method
   * @param  {Object} values - Object with field names as key and field values as value
   * @return {Promise} - Promise
   */
  "googleWebTools/updateGoogleWebToolsSettings"(values) {
    check(values, Object);
    check(values.siteVerificationToken, String);

    // must have core permissions
    if (!Reaction.hasPermission("core")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    const stringValue = EJSON.stringify(values);
    const update = EJSON.parse(stringValue);
    return Packages.update({ name: "google-webtools" }, { $set: { settings: { public: update } } });
  }
};

Meteor.methods(methods);
