/**
 * CollectionFS - Image/Video Publication
 * @params {Array} shops - array of current shop object
 */
Meteor.publish("Media", function (shops) {
  check(shops, Match.Optional(Array));
  let Media = ReactionCore.Collections.Media;
  let selector;
  let shopId = ReactionCore.getShopId(this);

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
  return Media.find(selector, {
    sort: {
      "metadata.priority": 1
    }
  });
});
