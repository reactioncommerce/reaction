import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/lib/api";
import { Tags } from "/lib/collections";

/**
 * @name shop/hideHeaderTag
 * @method
 * @memberof Shop/Methods
 * @param {String} tagId - method to remove tag navigation tags
 * @return {String} returns remove result
 */
export default function hideHeaderTag(tagId) {
  check(tagId, String);
  // must have core permissions
  if (!Reaction.hasPermission("core")) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }
  this.unblock();
  // hide it
  return Tags.update({
    _id: tagId
  }, {
    $set: {
      isTopLevel: false
    }
  });
}
