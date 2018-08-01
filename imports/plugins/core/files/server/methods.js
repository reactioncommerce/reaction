import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";
import { MediaRecords } from "/lib/collections";

/**
 * Media-related Meteor methods
 * @namespace Media/Methods
 */

/**
 * @method updateMediaMetadata
 * @memberof Media/Methods
 * @summary Updates a media record.
 * @param {String} fileRecordId - _id of updated file record.
 * @param {Object} metadata - metadata from updated media file.
 * @return {Boolean}
 * @private
 */
async function updateMediaMetadata(fileRecordId, metadata) {
  check(fileRecordId, String);
  check(metadata, Object);

  const result = MediaRecords.update({
    _id: fileRecordId
  }, {
    $set: {
      metadata
    }
  });

  return result === 1;
}

/**
 * @name media/insert
 * @method
 * @memberof Media/Methods
 * @summary Insert a new media record.
 * @param {Object} fileRecord - document from file collection upload.
 * @return {String} - _id of the new inserted media record.
 */
export async function insertMedia(fileRecord) {
  check(fileRecord, Object);
  const mediaRecordId = await MediaRecords.insert({
    ...fileRecord,
    metadata: {
      ...fileRecord.metadata,
      workflow: "published"
    }
  });

  return mediaRecordId;
}

/**
 * @name media/remove
 * @method
 * @memberof Media/Methods
 * @summary Unpublish a media record by updating it's workflow
 * @param {String} fileRecordId - _id of file record to be deleted.
 * @return {Boolean}
 */
export async function removeMedia(fileRecordId) {
  check(fileRecordId, String);

  const result = MediaRecords.update({
    _id: fileRecordId
  }, {
    $set: {
      "metadata.workflow": "archived"
    }
  });

  return result === 1;
}

/**
 * @name media/updatePriorities
 * @method
 * @memberof Media/Methods
 * @summary sorting media by array indexes
 * @param {String[]} sortedMediaIDs
 * @return {Boolean} true
 */
export function updateMediaPriorities(sortedMediaIDs) {
  check(sortedMediaIDs, [String]);

  if (!Reaction.hasPermission("createProduct")) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  // Check to be sure product linked with each media belongs to the current user's current shop
  const shopId = Reaction.getShopId();

  const sortedMediaRecords = MediaRecords.find({
    _id: { $in: sortedMediaIDs }
  }).fetch();

  sortedMediaRecords.forEach((mediaRecord) => {
    if (!mediaRecord.metadata || mediaRecord.metadata.shopId !== shopId) {
      throw new ReactionError("access-denied", `Access Denied. No access to shop ${mediaRecord.metadata.shopId}`);
    }
  });

  if (sortedMediaRecords.length !== sortedMediaIDs.length) {
    throw new ReactionError("not-found", "At least one ID in sortedMediaIDs does not exist");
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
