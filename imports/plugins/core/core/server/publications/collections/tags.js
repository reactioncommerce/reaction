import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Tags } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * tags
 */
Meteor.publish("Tags", function (tagIds) {
  check(tagIds, Match.OneOf(undefined, Array));

  const shopId = Reaction.getShopId();

  // Only let users what have createProduct permissions see the tags
  if (!Reaction.hasPermission(["createProduct"], this.userId)) {
    return this.ready();
  }

  // Prevent subscribing to all tags
  if (!Array.isArray(tagIds)) {
    return this.ready();
  }

  if (!shopId) {
    return this.ready();
  }

  const selector = {
    _id: {
      $in: tagIds
    }
  };

  if (!Reaction.isShopPrimary()) {
    selector.shopId = shopId;
  }

  return Tags.find(selector);
});
