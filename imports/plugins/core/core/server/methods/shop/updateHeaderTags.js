import Logger from "@reactioncommerce/logger";
import { check, Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/lib/api";
import ReactionError from "@reactioncommerce/reaction-error";
import { Tags } from "/lib/collections";
import getSlug from "/imports/plugins/core/core/server/Reaction/getSlug";

/**
 * @name shop/updateHeaderTags
 * @method
 * @memberof Shop/Methods
 * @summary method to insert or update tag with hierarchy
 * @param {String} tagName will insert, tagName + tagId will update existing
 * @param {String} tagId - tagId to update
 * @param {String} currentTagId - currentTagId will update related/hierarchy
 * @returns {Boolean} return true/false after insert
 */
export default function updateHeaderTags(tagName, tagId, currentTagId) {
  check(tagName, String);
  check(tagId, Match.OneOf(String, null, undefined));
  check(currentTagId, Match.OneOf(String, null, undefined));

  const shopId = Reaction.getShopId();

  // Must have 'core' permissions for the current shop ID. We then pass in
  // that shopId to all of the Tags.update calls below to ensure that
  // all of the modified tags belong to this shop.
  if (!Reaction.hasPermission("core", Reaction.getUserId(), shopId)) {
    throw new ReactionError("access-denied", "Access Denied");
  }
  this.unblock();

  const newTag = {
    slug: getSlug(tagName),
    name: tagName
  };

  const existingTag = Tags.findOne({
    slug: getSlug(tagName),
    name: tagName
  });

  let result;

  if (tagId) {
    result = Tags.update({ _id: tagId, shopId }, { $set: newTag });
    Logger.debug(`Changed name of tag ${tagId} to ${tagName}`);
    return result;
  }

  if (existingTag) {
    // if is currentTag
    if (currentTagId) {
      result = Tags.update({ _id: currentTagId, shopId }, {
        $addToSet: {
          relatedTagIds: existingTag._id
        }
      });
      Logger.debug(`Added tag ${existingTag.name} to the related tags list for tag ${currentTagId}`);
      return result;
    }

    // update existing tag
    result = Tags.update({ _id: existingTag._id, shopId }, {
      $set: {
        isTopLevel: true
      }
    });
    Logger.debug(`Marked tag ${existingTag.name} as a top level tag`);
    return result;
  }

  // create newTags
  const newTagId = Meteor.call("shop/createTag", tagName, !currentTagId);

  // if result is an Error object, we return it immediately
  if (typeof newTagId !== "string") return newTagId;

  if (currentTagId) {
    result = Tags.update({ _id: currentTagId, shopId }, {
      $addToSet: {
        relatedTagIds: newTagId
      }
    });
    Logger.debug(`Added tag${newTag.name} to the related tags list for tag ${currentTagId}`);
    return result;
  }

  // TODO: refactor this. unnecessary check
  if (typeof newTagId === "string" && !currentTagId) return true;

  throw new ReactionError("access-denied", "Failed to update header tags.");
}
