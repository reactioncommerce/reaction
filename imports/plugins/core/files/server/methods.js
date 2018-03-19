import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import includes from "lodash/includes";
import { Hooks } from "/server/api";
import { Reaction } from "/server/api";
import { MediaRecords, Revisions } from "/lib/collections";
import { RevisionApi } from "/imports/plugins/core/revisions/lib/api";

/**
 * @method updateMediaMetadata
 * @memberof media
 * @summary insert a new media record and add it to revision control.
 * @param {Object} fileRecord - document from file collection upload.
 * @return {String} - _id of the new inserted media record.
 */
export async function updateMediaMetadata(fileRecordId, metadata) {
  console.log("Update Media Metadata", fileRecordId, metadata)
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

      return false; // prevent actual update of image. This also stops other hooks from running :/
    }
  }
  // for non-product images, just ignore and keep on moving
  return true;
}


Meteor.methods({
  /**
   * updateMediaPriorities
   * @summary sorting media by array indexes
   * @type {Method}
   * @param {String[]} sortedMediaIDs
   * @return {Boolean} true
   */
  "media/updatePriorities"(sortedMediaIDs) {
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
});
