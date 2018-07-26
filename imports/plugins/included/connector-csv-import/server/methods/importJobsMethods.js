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
      ImportJobs.insert(Object.assign(update, {
        shopId,
        status: "New",
        importMapping: "create",
        userId: Meteor.userId()
      }));
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
  },

  /**
   * @name importJobs/createMapping
   * @method
   * @memberof importJobs/Methods
   * @param {String} importJobId TODO
   * @param {String} name TODO
   * @param {String} mapping TODO
   * @return {undefined}
   */
  "importJobs/createMapping"(importJobId, name, mapping) {
    check(importJobId, String);
    check(name, String);
    check(mapping, Object);
    // TODO: Check permission ???
    const importJob = ImportJobs.findOne(importJobId);
    const shopId = Reaction.getShopId();
    const imporMappingId = ImportMappings.insert({
      name,
      shopId,
      collection: importJob.collection,
      mapping
    });
    ImportJobs.update(importJobId, { $set: { importMapping: imporMappingId, mapping } });
  },

  "importJobs/updateMapping"(importJobId, updateMapping, mapping) {
    check(importJobId, String);
    check(updateMapping, Boolean);
    check(mapping, Object);
    const importJob = ImportJobs.findOne(importJobId);
    if (updateMapping) {
      ImportMappings.update(importJob.importMapping, { $set: { mapping } });
    }
    ImportJobs.update(importJobId, { $set: { mapping } });
  },

  "importJobs/setStatusToPending"(importJobId) {
    check(importJobId, String);
    ImportJobs.update(importJobId, { $set: { status: "pending", uploadedAt: new Date() } });
  }

};

Meteor.methods(methods);
