import { check } from "meteor/check";
import { Reaction } from "/lib/api";
import ReactionError from "@reactioncommerce/reaction-error";
import { Tags, Products } from "/lib/collections";

/**
 * @name shop/removeHeaderTag
 * @method
 * @memberof Shop/Methods
 * @param {String} tagId - method to remove tag navigation tags
 * @param {String} currentTagId - currentTagId
 * @return {String} returns remove result
 */
export default function removeHeaderTag(tagId, currentTagId) {
  check(tagId, String);
  check(currentTagId, String);
  // must have core permissions
  if (!Reaction.hasPermission("core")) {
    throw new ReactionError("access-denied", "Access Denied");
  }
  this.unblock();
  // remove from related tag use
  Tags.update(currentTagId, {
    $pull: {
      relatedTagIds: tagId
    }
  });
  // check to see if tag is in use.
  const productCount = Products.find({
    hashtags: tagId
  }).count();
  // check to see if in use as a related tag
  const relatedTagsCount = Tags.find({
    relatedTagIds: tagId
  }).count();
  // not in use anywhere, delete it
  if (productCount === 0 && relatedTagsCount === 0) {
    return Tags.remove(tagId);
  }
  // unable to delete anything
  throw new ReactionError("access-denied", "Unable to delete tags that are in use.");
}
