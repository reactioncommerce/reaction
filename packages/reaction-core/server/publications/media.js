/**
 * CollectionFS - Image/Video Publication
 * @params {Array} shops - array of current shop object
 */

var Media = ReactionCore.Collections.Media;

Meteor.publish("Media", function(shops) {
  var selector, shopId;
  check(shops, Match.Optional(Array));
  shopId = ReactionCore.getShopId(this);
  if (shopId) {
    selector = {
      'metadata.shopId': shopId
    };
  }
  if (shops) {
    selector = {
      'metadata.shopId': {
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
