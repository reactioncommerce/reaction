import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Hooks, Reaction } from "/server/api";
import { MediaRecords, Revisions } from "/lib/collections";
import { Media } from "/imports/plugins/core/files/server";
import { RevisionApi } from "/imports/plugins/core/revisions/lib/api";

/**
 * @method updateMediaMetadata
 * @memberof media
 * @summary updates media record in revision control.
 * @param {String} fileRecordId - _id of updated file record.
 * @param {Object} metadata - metadata from updated media file.
 * @return {Boolean}
 */
export async function updateMediaMetadata(fileRecordId, metadata) {
  check(fileRecordId, String);
  check(metadata, Object);
  if (RevisionApi.isRevisionControlEnabled()) {
    if (metadata.productId) {
      const existingRevision = Revisions.findOne({
        "documentId": fileRecordId,
        "workflow.status": {
          $nin: [
            "revision/published"
          ]
        }
      });
      if (existingRevision) {
        const updatedMetadata = Object.assign({}, existingRevision.documentData, metadata);
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
        Hooks.Events.run("afterRevisionsUpdate", Meteor.userId(), {
          ...existingRevision,
          documentData: updatedMetadata
        });
      } else {
        Revisions.insert({
          documentId: fileRecordId,
          documentData: metadata,
          documentType: "image",
          parentDocument: metadata.productId,
          changeType: "update",
          workflow: {
            status: "revision/update"
          }
        });
      }

      return false;
    }
  }
  // for non-product images, just ignore and keep on moving
  return true;
}

/**
 * @method insertMedia
 * @memberof media
 * @summary insert a new media record and add it to revision control.
 * @param {Object} fileRecord - document from file collection upload.
 * @return {String} - _id of the new inserted media record.
 */
export async function insertMedia(fileRecord) {
  check(fileRecord, Object);
  const mediaRecordId = await MediaRecords.insert(fileRecord);

  if (RevisionApi.isRevisionControlEnabled() && fileRecord.metadata.workflow !== "published") {
    if (fileRecord.metadata.productId) {
      const revisionMetadata = Object.assign({}, fileRecord.metadata);
      revisionMetadata.workflow = "published";
      Revisions.insert({
        documentId: mediaRecordId,
        documentData: revisionMetadata,
        documentType: "image",
        parentDocument: fileRecord.metadata.productId,
        changeType: "insert",
        workflow: {
          status: "revision/update"
        }
      });
      MediaRecords.update({
        _id: mediaRecordId
      }, {
        $set: {
          "metadata.workflow": "unpublished"
        }
      });
    } else {
      MediaRecords.update({
        _id: mediaRecordId
      }, {
        $set: {
          "metadata.workflow": "published"
        }
      });
    }
  }

  return mediaRecordId;
}

/**
 * @method removeMedia
 * @memberof media
 * @summary removes media file and updates record in revision control.
 * @param {String} fileRecordId - _id of file record to be deleted.
 * @return {Boolean}
 */
export async function removeMedia(fileRecordId) {
  check(fileRecordId, String);
  const { metadata } = MediaRecords.findOne({ _id: fileRecordId });
  if (RevisionApi.isRevisionControlEnabled() && metadata.workflow && metadata.workflow === "unpublished") {
    Revisions.remove({
      documentId: fileRecordId
    });
    Media.remove(fileRecordId);
    return true;
  } else if (metadata.productId) {
    Revisions.insert({
      documentId: fileRecordId,
      documentData: metadata,
      documentType: "image",
      parentDocument: metadata.productId,
      changeType: "remove",
      workflow: {
        status: "revision/update"
      }
    });
    return true;
  }
  return false;
}

/**
 * updateMediaPriorities
 * @summary sorting media by array indexes
 * @type {Method}
 * @param {String[]} sortedMediaIDs
 * @return {Boolean} true
 */
export function updateMediaPriorities(sortedMediaIDs) {
  check(sortedMediaIDs, [String]);

  if (!Reaction.hasPermission("createProduct")) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  // Check to be sure product linked with each media belongs to the current user's current shop
  const shopId = Reaction.getShopId();

  const sortedMediaRecords = MediaRecords.find({
    _id: { $in: sortedMediaIDs }
  }).fetch();

  sortedMediaRecords.forEach((mediaRecord) => {
    if (!mediaRecord.metadata || mediaRecord.metadata.shopId !== shopId) {
      throw new Meteor.Error("access-denied", `Access Denied. No access to shop ${mediaRecord.metadata.shopId}`);
    }
  });

  if (sortedMediaRecords.length !== sortedMediaIDs.length) {
    throw new Meteor.Error("not-found", "At least one ID in sortedMediaIDs does not exist");
  }

  sortedMediaIDs.forEach((_id, index) => {
    MediaRecords.update({
      _id
    }, {
      $set: {
        "metadata.priority": index
      }
    });
    const { metadata } = MediaRecords.findOne({ _id });
    updateMediaMetadata(_id, metadata);
  });

  return true;
}

Meteor.methods({
  "media/insert": insertMedia,
  "media/updatePriorities": updateMediaPriorities,
  "media/remove": removeMedia
});
