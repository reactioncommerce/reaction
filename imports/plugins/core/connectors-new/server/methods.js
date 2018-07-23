import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { MeteorImportFiles } from "./importFileCollections";

/**
 * Media-related Meteor methods
 * @namespace Media/Methods
 */

/**
 * @name media/insert
 * @method
 * @memberof Media/Methods
 * @summary Insert a new media record.
 * @param {Object} fileRecord - document from file collection upload.
 * @return {String} - _id of the new inserted media record.
 */
export async function insertImportFile(fileRecord) {
  check(fileRecord, Object);
  const importFileId = await MeteorImportFiles.insert({
    ...fileRecord,
    metadata: {
      ...fileRecord.metadata,
      workflow: "published"
    }
  });

  return importFileId;
}

Meteor.methods({
  "importFiles/insert": insertImportFile
});
