import { Readable } from "stream";
import _ from "lodash";
import S3 from "aws-sdk/clients/s3";
import SFTPClient from "ssh2-sftp-client";
import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { EJSON } from "meteor/ejson";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { Packages } from "/lib/collections";
import { JobItems, Mappings } from "../lib/collections";

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
    check(values.port, String);
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
  async "csvConnector/sftpTestForImportAndExport"() {
    // must have core permissions
    if (!Reaction.hasPermission("core")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    const pkg = Packages.findOne({ name: "connector-settings-sftp" });
    const { settings: { ipAddress, port, username, password } } = pkg || {};
    const sftpClient = new SFTPClient();
    return new Promise((resolve, reject) => {
      sftpClient.connect({
        host: ipAddress,
        port,
        username,
        password
      }).then(() => resolve(true)).catch((error) => reject(error));
    });
  },

  /**
   * @name csvConnector/saveJobItem
   * @summary Saves a job item to the database
   * @method
   * @param {Object} values - job item values
   * @return {String} - new job item ID
   */
  "csvConnector/saveJobItem"(values) {
    check(values, Object);
    const {
      collection,
      fileSource,
      hasHeader,
      jobSubType,
      jobType,
      mappingByUser,
      mappingId,
      name,
      newMappingName,
      previousJobId,
      saveMappingAction,
      s3ExportFileKey,
      s3ImportFileKey,
      sftpExportFilePath,
      sftpImportFilePath,
      shouldExportToS3,
      shouldExportToSFTP,
      shouldSaveToNewMapping
    } = values;

    const shopId = Reaction.getShopId();

    let newMappingId = "default";
    if ((mappingId === "default" && shouldSaveToNewMapping) || (mappingId !== "default" && saveMappingAction === "create")) {
      newMappingId = Mappings.insert({
        shopId,
        name: newMappingName,
        collection,
        mapping: mappingByUser
      });
    } else if (mappingId !== "default") {
      newMappingId = mappingId;
      if (saveMappingAction === "update") {
        Mappings.update({ _id: mappingId }, { $set: { mapping: mappingByUser } });
      }
    }

    let jobItemValues;

    const commonValues = {
      collection,
      jobSubType,
      jobType,
      mappingId: newMappingId,
      name,
      shopId,
      status: "pending",
      uploadedAt: new Date(),
      userId: Meteor.userId()
    };

    if (jobType === "import") {
      jobItemValues = Object.assign(commonValues, {
        fileSource,
        hasHeader,
        mapping: mappingByUser
      });
      if (fileSource === "s3") {
        jobItemValues.s3ImportFileKey = s3ImportFileKey;
      } else if (fileSource === "sftp") {
        jobItemValues.sftpImportFilePath = sftpImportFilePath;
      }
    } else {
      jobItemValues = Object.assign(commonValues, {
        shouldExportToS3: !!shouldExportToS3,
        shouldExportToSFTP: !!shouldExportToSFTP
      });
      if (shouldExportToS3) {
        jobItemValues.s3ExportFileKey = s3ExportFileKey;
      }
      if (shouldExportToSFTP) {
        jobItemValues.sftpExportFilePath = sftpExportFilePath;
      }
    }

    if (_.isEmpty(mappingByUser) && mappingId && mappingId !== "default") {
      const mapping = Mappings.findOne({ _id: mappingId });
      jobItemValues.mapping = mapping.mapping;
    }

    if (previousJobId) {
      const previousJob = JobItems.findOne({ _id: previousJobId });
      jobItemValues.name = previousJob.name;
      jobItemValues.previousJobId = previousJobId;
    }

    const jobItemId = JobItems.insert(jobItemValues);

    return jobItemId;
  },

  /**
   * @name csvConnector/removeJobItem
   * @summary Removes a job item from the database, provided that job item is not in progress
   * @method
   * @param {String} jobItemId - job item values
   * @return {Promise} - if deletion is successful
   */
  "csvConnector/removeJobItem"(jobItemId) {
    check(jobItemId, String);
    const jobItem = JobItems.findOne({ _id: jobItemId });
    const { status } = jobItem;
    if (status === "inProgress") {
      throw new Meteor.Error("invalid", "Job item is in progress and can't be deleted.");
    }
    return JobItems.update({ _id: jobItemId }, { $set: { isDeleted: true } });
  }
};

Meteor.methods(methods);
