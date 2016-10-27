import { Media } from "/lib/collections";
import { Reaction } from "/server/api";

/**
 * CollectionFS - Image/Video Publication
 * @params {Array} shops - array of current shop object
 */
Meteor.publish("Media", function (shops) {
  check(shops, Match.Optional(Array));
  let selector;
  const shopId = Reaction.getShopId();
  if (!shopId) {
    return this.ready();
  }
  if (shopId) {
    selector = {
      "metadata.shopId": shopId
    };
  }
  if (shops) {
    selector = {
      "metadata.shopId": {
        $in: shops
      }
    };
  }

  if (!Reaction.hasPermission(["createProduct"], this.userId)) {
    selector["metadata.workflow"] = {
      $in: [null, "published"]
    };
  } else {
    selector["metadata.workflow"] = {
      $nin: ["archived"]
    };
  }

  return Media.find(selector, {
    sort: {
      "metadata.priority": 1
    }
  });
});
