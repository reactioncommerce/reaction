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

/**
 * @method updateMediaMetadata
 * @memberof media
 * @summary insert a new media record and add it to revision control.
 * @param {Object} fileRecord - document from file collection upload.
 * @return {String} - _id of the new inserted media record.
 */
export async function updateMediaMetadata(userId, fileRecord, fieldNames, modifier) {
  console.log(fileRecord)
  check(fileRecord, Object);
  if (RevisionApi.isRevisionControlEnabled() === false) {
    return true;
  }
  // if it's not metadata ignore it, as LOTS of othing things change on this record
  if (!_.includes(fieldNames, "metadata")) {
    return true;
  }

  if (fileRecord.metadata.productId) {
    const convertedModifier = convertMetadata(modifier.$set);
    const convertedMetadata = Object.assign({}, fileRecord.metadata, convertedModifier);
    const existingRevision = Revisions.findOne({
      "documentId": fileRecord._id,
      "workflow.status": {
        $nin: [
          "revision/published"
        ]
      }
    });
    if (existingRevision) {
      const updatedMetadata = Object.assign({}, existingRevision.documentData, convertedMetadata);
      // Special case where if we have both added and reordered images before publishing we don't want to overwrite
      // the workflow status since it would be "unpublished"
      if (existingRevision.documentData.workflow === "published" || existingRevision.changeType === "insert") {
        updatedMetadata.workflow = "published";
      }
      Revisions.update({ _id: existingRevision._id }, {
        $set: {
          documentData: updatedMetadata
        }
      });
      Hooks.Events.run("afterRevisionsUpdate", userId, {
        ...existingRevision,
        documentData: updatedMetadata
      });
    } else {
      Revisions.insert({
        documentId: fileRecord._id,
        documentData: convertedMetadata,
        documentType: "image",
        parentDocument: fileRecord.metadata.productId,
        changeType: "update",
        workflow: {
          status: "revision/update"
        }
      });
    }

    return false; // prevent actual update of image. This also stops other hooks from running :/
  }
  // for non-product images, just ignore and keep on moving
  return true;
}

Meteor.methods({
  "media/insert": insertMedia,
  "media/updateMetadata": updateMediaMetadata
});
