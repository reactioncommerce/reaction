import { Meteor } from "meteor/meteor";
import { Tags } from "/lib/collections";
import { Reaction } from "/server/api";

/**
 * tags
 */
Meteor.publish("Tags", function () {
  const selector = {};

  const shopId = Reaction.getShopId();

  if (!shopId) {
    return this.ready();
  }

  if (!Reaction.isShopPrimary()) {
    selector.shopId = shopId;
  }

  // TODO: filter tag results based on permissions and isVisible or some other
  // publication quality
  return Tags.find(selector);
});
