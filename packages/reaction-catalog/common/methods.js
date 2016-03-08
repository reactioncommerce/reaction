ReactionProductAPI = {};
ReactionProductAPI.methods = {};

/**
 * removeMedia
 * @summary remove media from mongodb collection
 * @type {ValidatedMethod}
 * @param {String} mediaId - media _id
 * @return {Error|Undefined} object with error or nothing
 */
ReactionProductAPI.methods.removeMedia = new ValidatedMethod({
  name: "removeMedia",
  validate: new SimpleSchema({
    mediaId: { type: String }
  }).validator(),
  run({ mediaId }) {
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    return ReactionCore.Collections.Media.remove({ _id: mediaId });
  }
});

/**
 * updateMediaPriorities
 * @summary sorting media by array indexes
 * @type {ValidatedMethod}
 * @param {Array} sortedMedias - array with images _ids
 * @return {Array} with results
 */
ReactionProductAPI.methods.updateMediaPriorities = new ValidatedMethod({
  name: "updateMediaPriorities",
  validate: new SimpleSchema({
    sortedMedias: { type: [new SimpleSchema({ mediaId: { type: String } })] }
  }).validator(),
  run({ sortedMedias }) {
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    const results = [];
    sortedMedias.forEach((image, index) => {
      results.push(ReactionCore.Collections.Media.update(image.mediaId, {
        $set: {
          "metadata.priority": index
        }
      }));
    });

    return results;
  }
});
