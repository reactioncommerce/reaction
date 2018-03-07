import SimpleSchema from "simpl-schema";
import { Meteor } from "meteor/meteor";
import { ValidatedMethod } from "meteor/mdg:validated-method";
import { Media } from "/lib/collections";
import { Reaction } from "/server/api";

/**
 * removeMedia
 * @summary remove media from mongodb collection
 * @type {ValidatedMethod}
 * @param {String} mediaId - media _id
 * @return {Error|Undefined} object with error or nothing
 */
export const removeMedia = new ValidatedMethod({
  name: "removeMedia",
  validate: new SimpleSchema({
    mediaId: String
  }).validator(),
  run({ mediaId }) {
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    return Media.remove({ _id: mediaId });
  }
});

/**
 * updateMediaPriorities
 * @summary sorting media by array indexes
 * @type {ValidatedMethod}
 * @param {Array} sortedMedias - array with images _ids
 * @return {Array} with results
 */
export const updateMediaPriorities = new ValidatedMethod({
  name: "updateMediaPriorities",
  validate: new SimpleSchema({
    "sortedMedias": Array,
    "sortedMedias.$": Object,
    "sortedMedias.$.mediaId": String
  }).validator(),
  run({ sortedMedias }) {
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }
    const results = [];
    sortedMedias.forEach((image, index) => {
      results.push(Media.update(image.mediaId, {
        $set: {
          "metadata.priority": index
        }
      }));
    });

    return results;
  }
});
