/**
 * products publication
 * @param {Number} productScrollLimit - optional, defaults to 20
 * @param {Array} shops - array of shopId to retrieve product from.
 * @return {Object} return product cursor
 */
Meteor.publish("Products", function (productScrollLimit, shops) {
  check(productScrollLimit, Match.OneOf(null, undefined, Number));
  check(shops, Match.Optional(Array));

  let shopAdmin;
  let shop = ReactionCore.getCurrentShop();
  let Products = ReactionCore.Collections.Products;
  let limit = productScrollLimit || 10;
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
      },
      limit: limit
    });
  }
  this.ready();
});

/**
 * product detail publication
 * @param {String} productId - productId
 * @return {Object} return product cursor
 */
Meteor.publish("Product", function (productId) {
  check(productId, String);
  let shop = ReactionCore.getCurrentShop();
  let Products = ReactionCore.Collections.Products;
  let selector = {};
  selector.isVisible = true;

  if (Roles.userIsInRole(this.userId, ["owner", "admin", "createProduct"],
      shop._id)) {
    selector.isVisible = {
      $in: [true, false]
    };
  }
  // TODO review for REGEX / DOS vulnerabilities.
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
  return ReactionCore.Collections.Tags.find({
    shopId: ReactionCore.getShopId()
  });
});
