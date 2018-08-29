import S3 from "aws-sdk/clients/s3";
import Client from "ssh2-sftp-client";
import { Readable } from "stream";
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
   * @return {Promise} - Promise
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
   * @return {Promise} - Promise
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
  },

  /**
   * @name csvConnector/s3TestForExport
   * @summary Tests S3 credentials for write access
   * @method
   * @return {Promise} - Promise
   */
  "csvConnector/s3TestForExport"() {
    // must have core permissions
    if (!Reaction.hasPermission("core")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    const pkg = Packages.findOne({ name: "connector-settings-aws-s3" });
    const { settings: { accessKey, secretAccessKey, bucket } } = pkg || {};
    const S3Config = new S3({
      accessKeyId: accessKey,
      secretAccessKey
    });
    return new Promise((resolve, reject) => {
      const stream = new Readable();
      stream.push("This is just a sample CSV export file from Reaction.");
      stream.push(null);
      S3Config.upload({ Bucket: bucket, Key: "ReactionCSVExport--TestOnly.txt", Body: stream }, (error, result) => {
        if (result) {
          resolve(true);
          return;
        }
        reject(error);
        return;
      });
    });
  },

  /**
   * @name csvConnector/s3TestForImport
   * @summary Tests S3 credentials for read access
   * @method
   * @return {Promise} - Promise
   */
  "csvConnector/s3TestForImport"() {
    // must have core permissions
    if (!Reaction.hasPermission("core")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    const pkg = Packages.findOne({ name: "connector-settings-aws-s3" });
    const { settings: { accessKey, secretAccessKey, bucket } } = pkg || {};
    const S3Config = new S3({
      accessKeyId: accessKey,
      secretAccessKey
    });
    // Check read access
    return new Promise((resolve, reject) => {
      S3Config.getObject({ Bucket: bucket, Key: "test.txt" }, (error, result) => {
        if (result || (error && error.code === "NoSuchKey")) {
          resolve(true);
          return;
        }
        reject(error);
        return;
      });
    });
  },

  /**
   * @name csvConnector/sftpTestForImportAndExport
   * @summary Tests SFTP credentials for access
   * @method
   * @return {Promise} - Promise
   */
  "csvConnector/sftpTestForImportAndExport"() {
    // must have core permissions
    if (!Reaction.hasPermission("core")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    const pkg = Packages.findOne({ name: "connector-settings-sftp" });
    const { settings: { ipAddress, port, username, password } } = pkg || {};
    console.log(ipAddress, port, username, password);
    const sftpClient = new Client();
    sftpClient.connect({
      host: ipAddress,
      port: `${port}`,
      username,
      password
    }).then(() => sftpClient.list("/")).then((data) => console.log(data)).catch((error) => {
      console.log(error);
    });
  }
};

Meteor.methods(methods);
