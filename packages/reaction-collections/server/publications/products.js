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
  let selector;
  let shop = ReactionCore.getCurrentShop();
  if (typeof shop !== "object") {
    return this.ready();
  }
  const { Products } = ReactionCore.Collections;
  // TODO this limit has another meaning now. We should calculate only objects
  // with type="simple", but we need to get all types for additional images
  const limit = productScrollLimit || 10;
  // handle multiple shops
  if (shops) {
    selector = {
      shopId: {
        $in: shops
      },
      type: "simple"
    };
    // check if this user is a shopAdmin
    for (let thisShopId of shops) {
      if (Roles.userIsInRole(this.userId, ["admin", "createProduct"],
          thisShopId)) {
        shopAdmin = true;
      }
    }
  } else {
    selector = {
      shopId: shop._id,
      type: "simple"
    };
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
});

/**
 * product detail publication
 * @param {String} productId - productId
 * @return {Object} return product cursor
 */
Meteor.publish("Product", function (productId) {
  check(productId, String);
  let _id;
  let shop = ReactionCore.getCurrentShop();
  if (typeof shop !== "object") {
    return this.ready();
  }
  const { Products } = ReactionCore.Collections;
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
    // TODO try/catch here because we can have product handle passed by such regex
    _id = productId;
  } else {
    selector.handle = {
      $regex: productId,
      $options: "i"
    };
    const products = Products.find(selector).fetch();
    if (products.length > 0) {
      _id = products[0]._id;
    } else {
      return this.ready();
    }
  }
  selector = { $or: [{ _id: _id }, { ancestors: { $in: [_id] }}] };

  return Products.find(selector);
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
