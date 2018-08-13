import { Meteor } from "meteor/meteor";
import { Mongo } from "meteor/mongo";

/**
 * Meteor Mongo.Collection instances that are available only in browser code
 * @namespace Collections/ClientOnly
 */

/**
 * @name importFileRecordsIndex
 * @private
 * @param {RawMongoCollection} rawImportFile
 *
 * Sets up necessary indexes on the Media FileCollection
 */
async function importFileRecordsIndex(rawImportFile) {
  try {
    await rawImportFile.createIndex({ "metadata.importJobId": 1 }, { background: true });
    // These queries are used by the workers in file-collections package
    await rawImportFile.createIndex({ "original.remoteURL": 1 }, { background: true });
    await rawImportFile.createIndex({ "original.tempStoreId": 1 }, { background: true });
  } catch (error) {
    console.error(error); // eslint-disable-line no-console
  }
}

/**
 * @name ImportFileRecords
 * @memberof Collections
 * @type {MongoCollection}
 */
export const ImportFileRecords = new Mongo.Collection("cfs.ImportFiles.filerecord");

// Index on the props we search on
if (Meteor.isServer) {
  importFileRecordsIndex(ImportFileRecords.rawCollection());
}
