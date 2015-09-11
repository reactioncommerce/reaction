/**
 * products
 */
var Products = ReactionCore.Collections.Products;
var Tags = ReactionCore.Collections.Tags;

Meteor.publish('Products', function(shops) {
  var selector, shop, shopAdmin, _i, _len;
  check(shops, Match.Optional(Array));
  shop = ReactionCore.getCurrentShop(this);
  if (shop) {
    selector = {
      shopId: shop._id
    };
    if (shops) {
      selector = {
        shopId: {
          $in: shops
        }
      };
      for (_i = 0, _len = shops.length; _i < _len; _i++) {
        shop = shops[_i];
        if (Roles.userIsInRole(this.userId, ['admin', 'createProduct'], shop._id)) {
          shopAdmin = true;
        }
      }
    }
    if (!(Roles.userIsInRole(this.userId, ['owner'], shop._id) || shopAdmin)) {
      selector.isVisible = true;
    }
    return Products.find(selector, {
      sort: {
        title: 1
      }
    });
  } else {
    return [];
  }
});

Meteor.publish('Product', function(productId) {
  var selector, shop;
  check(productId, String);
  shop = ReactionCore.getCurrentShop(this);
  selector = {};
  selector.isVisible = true;
  if (Roles.userIsInRole(this.userId, ['owner', 'admin', 'createProduct'], shop._id)) {
    selector.isVisible = {
      $in: [true, false]
    };
  }
  if (productId.match(/^[A-Za-z0-9]{17}$/)) {
    selector._id = productId;
  } else {
    selector.handle = {
      $regex: productId,
      $options: "i"
    };
  }
  return Products.find(selector);
});

/**
 * tags
 */

Meteor.publish("Tags", function() {
  return Tags.find({
    shopId: ReactionCore.getShopId()
  });
});
