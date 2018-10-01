import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";
import * as Schemas from "./schemas";

/**
 * @name JobItems
 * @memberof Collections
 * @type {MongoCollection}
 */
export const JobItems = new Mongo.Collection("JobItems");

JobItems.attachSchema(Schemas.JobItems);

/**
 * @name Mappings
 * @memberof Collections
 * @type {MongoCollection}
 */
export const Mappings = new Mongo.Collection("Mappings");

Mappings.attachSchema(Schemas.Mappings);

/**
 * Meteor Mongo.Collection instances that are available only in browser code
 * @namespace Collections/ClientOnly
 */

/**
 * @name jobFileRecordsIndex
 * @private
 * @param {Object} rawJobFile - file upload
 * @returns {undefined}
 * Sets up necessary indexes on the Media FileCollection
 */
async function jobFileRecordsIndex(rawJobFile) {
  try {
    await rawJobFile.createIndex({ "metadata.jobItemId": 1 }, { background: true });
    // These queries are used by the workers in file-collections package
    await rawJobFile.createIndex({ "original.remoteURL": 1 }, { background: true });
    await rawJobFile.createIndex({ "original.tempStoreId": 1 }, { background: true });
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
  }
}

/**
 * @name JobFileRecords
 * @memberof Collections
 * @type {MongoCollection}
 */
export const JobFileRecords = new Mongo.Collection("cfs.JobFiles.filerecord");

// Index on the props we search on
if (Meteor.isServer) {
  jobFileRecordsIndex(JobFileRecords.rawCollection());
}
