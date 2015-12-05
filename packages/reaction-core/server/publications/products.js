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
  let shop = ReactionCore.getCurrentShop(this);
  let Products = ReactionCore.Collections.Products;
  // TODO this limit has another meaning now. We should calculate only objects
  // with type="simple", but we need to get all types for additional images
  let limit = productScrollLimit || 10;
  if (shop) {
    let selector = {
      shopId: shop._id//,
      // "$where": function () {
      //   let lim = limit;
      //   let counter = 0;
      //   if (this.type === "simple") {
      //     counter++;
      //     console.log(counter);
      //     return true;
      //   }
      // }.toString()
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
  // const sub = this;
  // let variantsHandle = [];
  let _id;
  const shop = ReactionCore.getCurrentShop(this);
  const Products = ReactionCore.Collections.Products;
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
    _id = Products.find(selector).fetch()[0]._id;
  }
  selector = { $or: [{ _id: _id }, { ancestors: { $in: [_id] }}] };

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
