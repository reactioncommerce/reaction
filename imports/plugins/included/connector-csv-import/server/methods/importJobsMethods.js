import { arrayToCSVRow, getDefaultCSVFileHeader } from "@reactioncommerce/reaction-import-connectors";
import { Meteor } from "meteor/meteor";
import { Match, check } from "meteor/check";
import { EJSON } from "meteor/ejson";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import { ImportJobs, ImportMappings } from "../../lib/collections";

/**
 * @file Methods for Taxes. Run these methods using `Meteor.call()`.
 *
 *
 * @namespace importJobs/Methods
*/

export const methods = {
  /**
   * @name importJobs/updateImportJobField
   * @method
   * @memberof importJobs/Methods
   * @param {String} _id TODO
   * @param {String} field TODO
   * @param {String} value TODO
   * @return {String} returns update/insert result
   */
  "importJobs/updateImportJobField"(_id, field, value) {
    check(_id, String);
    check(field, String);
    check(value, Match.OneOf(String, Object, Array, Boolean, Number));

    // Must have importJobs permission
    if (!Reaction.hasPermission("importJobs")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    let update;
    const stringValue = EJSON.stringify(value);
    if (value === "false" || value === "true") {
      const booleanValue = value === "true" || value === true;
      update = EJSON.parse(`{"${field}":${booleanValue}}`);
    } else {
      update = EJSON.parse(`{"${field}":${stringValue}}`);
    }

    if (!_id) {
      const shopId = Reaction.getShopId();
      ImportJobs.insert(Object.assign(update, { shopId, status: "New", importMapping: "default" }));
      return true;
    }

    const doc = ImportJobs.findOne(_id);
    if (!doc) {
      throw new Meteor.Error("not-found", "Import job not found");
    } else if (!Reaction.hasPermission("importJobs", this.userId, doc.shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    try {
      ImportJobs.update(_id, { $set: update });
    } catch (error) {
      throw new Meteor.Error("server-error", error.message);
    }
    return true;
  },

  /**
   * @name importJobs/getSampleCSVFileHeader
   * @method
   * @memberof importJobs/Methods
   * @param {String} collection TODO
   * @param {String} importMapping TODO
   * @return {undefined}
   */
  "importJobs/getSampleCSVFileHeader"(collection, importMapping) {
    check(collection, String);
    check(importMapping, String);
    if (importMapping === "default") {
      return getDefaultCSVFileHeader(collection);
    }
    const doc = ImportMappings.findOne(importMapping);
    const headers = Object.keys(doc.mapping).map((field) => field);
    return arrayToCSVRow(headers);
  }
};

Meteor.methods(methods);
