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
  const limit = productScrollLimit || 10;
  const shop = ReactionCore.getCurrentShop();
  const Products = ReactionCore.Collections.Products;

  if (typeof shop !== "object") {
    return this.ready();
  }

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
      for (let thisShopId of shops) {
        if (Roles.userIsInRole(this.userId, ["admin", "createProduct"],
            thisShopId)) {
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
 * @param {String} productId - productId or handle
 * @return {Object} return product cursor
 */
Meteor.publish("Product", function (productId) {
  check(productId, Match.Optional(String));
  if (!productId) {
    ReactionCore.Log.info("ignoring null request on Product subscription");
    return this.ready();
  }

  let shop = ReactionCore.getCurrentShop();
  // verify that shop is ready
  if (typeof shop !== "object") {
    return this.ready();
  }

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
  return ReactionCore.Collections.Products.find(selector);
});

/**
 * tags
 */
Meteor.publish("Tags", function () {
  const shopId = ReactionCore.getShopId();
  if (!shopId) {
    return this.ready();
  }
  return ReactionCore.Collections.Tags.find({
    shopId: shopId
  });
});
