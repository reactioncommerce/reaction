/**
 * products
 */
let Products = ReactionCore.Collections.Products;
let Tags = ReactionCore.Collections.Tags;

Meteor.publish("Products", function (shops) {
  check(shops, Match.Optional(Array));
  let shopAdmin;
  let shop = ReactionCore.getCurrentShop(this);

  if (shop) {
    let selector = {
      shopId: shop._id
    };
    // handle multiple shops
    if (shops) {
      selector = {
        shopId: {
          $in: shops
        }
      };
      // check if this user is a shopAdmin
      for (let thisShop of shops) {
        if (Roles.userIsInRole(this.userId, ["admin", "createProduct"],
            thisShop._id)) {
          shopAdmin = true;
        }
      }
    }

    // products are always visible to owners
    if (!(Roles.userIsInRole(this.userId, ["owner"], shop._id) || shopAdmin)) {
      selector.isVisible = true;
    }

    return Products.find(selector, {
      sort: {
        title: 1
      }
    });
  }
  return [];
});

Meteor.publish("Product", function (productId) {
  check(productId, String);

  let shop = ReactionCore.getCurrentShop(this);
  let selector = {};
  selector.isVisible = true;

  if (Roles.userIsInRole(this.userId, ["owner", "admin", "createProduct"],
      shop._id)) {
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
Meteor.publish("Tags", function () {
  return Tags.find({
    shopId: ReactionCore.getShopId()
  });
});
