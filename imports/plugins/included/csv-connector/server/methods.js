import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { EJSON } from "meteor/ejson";
import { Reaction } from "/lib/api";
import { Packages } from "/lib/collections";

export const methods = {
  /**
   * @name csvConnector/updateS3Settings
   * @summary Updates S3 Settings
   * @method
   * @param  {Object} values - Object with field names as key and field values as value
   * @return {undefined}
   */
  "csvConnector/updateS3Settings"(values) {
    check(values, Object);
    check(values.accessKey, String);
    check(values.secretAccessKey, String);
    check(values.bucket, String);

    // must have core permissions
    if (!Reaction.hasPermission("core")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    const stringValue = EJSON.stringify(values);
    const update = EJSON.parse(stringValue);
    return Packages.update({ name: "connector-settings-aws-s3" }, { $set: { settings: update } });
  },

  /**
   * @name csvConnector/updateSFTPSettings
   * @summary Updates SFTP Settings
   * @method
   * @param  {Object} values - Object with field names as key and field values as value
   * @return {undefined}
   */
  "csvConnector/updateSFTPSettings"(values) {
    check(values, Object);
    check(values.ipAddress, String);
    check(values.port, Number);
    check(values.username, String);
    check(values.password, String);

    // must have core permissions
    if (!Reaction.hasPermission("core")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    const stringValue = EJSON.stringify(values);
    const update = EJSON.parse(stringValue);
    return Packages.update({ name: "connector-settings-sftp" }, { $set: { settings: update } });
  }
};

Meteor.methods(methods);
