import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { MediaRecords, Revisions } from "/lib/collections";
import { RevisionApi } from "/imports/plugins/core/revisions/lib/api";

/**
 * @method insertMedia
 * @memberof media
 * @summary insert a new media record and add it to revision control.
 * @param {Object} fileRecord - document from file collection upload.
 * @return {String} - _id of the new inserted media record.
 */
export async function insertMedia(fileRecord) {
  check(fileRecord, Object);
  const mediaRecord = await MediaRecords.insert(fileRecord);

  if (RevisionApi.isRevisionControlEnabled() && fileRecord.metadata.workflow !== "published") {
    if (fileRecord.metadata.productId) {
      const revisionMetadata = Object.assign({}, fileRecord.metadata);
      revisionMetadata.workflow = "published";
      Revisions.insert({
        documentId: mediaRecord,
        documentData: revisionMetadata,
        documentType: "image",
        parentDocument: fileRecord.metadata.productId,
        changeType: "insert",
        workflow: {
          status: "revision/update"
        }
      });
      fileRecord.metadata.workflow = "unpublished";
    } else {
      fileRecord.metadata.workflow = "published";
    }
  }

  return mediaRecord;
}

Meteor.methods({ "media/insert": insertMedia });
