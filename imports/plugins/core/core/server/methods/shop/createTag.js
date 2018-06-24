import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Reaction } from "/lib/api";
import { Tags } from "/lib/collections";
import { getSlug } from "/server/api/core/utils";

/**
 * @name shop/createTag
 * @method
 * @memberof Shop/Methods
 * @summary creates new tag
 * @param {String} tagName - new tag name
 * @param {Boolean} isTopLevel - if true -- new tag will be created on top of
 * tags tree
 * @since 0.14.0
 * @hooks after method
 * @return {String} with created tag _id
 */
export default function createTag(tagName, isTopLevel) {
  check(tagName, String);
  check(isTopLevel, Boolean);

  // must have 'core' permissions
  if (!Reaction.hasPermission("core")) {
    throw new Meteor.Error("access-denied", "Access Denied");
  }

  const tag = {
    name: tagName,
    slug: getSlug(tagName),
    shopId: Reaction.getShopId(),
    isTopLevel,
    updatedAt: new Date(),
    createdAt: new Date()
  };

  return Tags.insert(tag);
}
