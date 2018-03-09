import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reaction } from "/server/api";
import { MediaRecords } from "/lib/collections";

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
    });

    return true;
  }
});
