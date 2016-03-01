/**
 * products publication
 * @param {Number} productScrollLimit - optional, defaults to 20
 * @param {Array} shops - array of shopId to retrieve product from.
 * @return {Object} return product cursor
 */
Meteor.publish("Products", function (productScrollLimit, productFilters) {
  check(productScrollLimit, Match.Optional(Number));
  // check(productFilters, Match.Optional(Object));
  // FIXME: We need to keep an eye on performance degradation with this check
  // and if it will be visible, I don't need we need this check in this
  // publication, because where is nothing important in product's data what we
  // need to protect so much.
  // Once again: this pub a bottleneck of all Reaction. This place should be as
  // as fast as possible.
  check(productFilters, Match.Optional({
    "shops": Match.Optional([String]),
    "tag": Match.Optional(String),
    "query": Match.Optional(String),
    "visibility": Match.Optional(Boolean),
    "details": Match.Optional(Object),
    "details.key": String,
    "details.value": String,
    "price": Match.Optional(Object),
    "price.min": Number,
    "price.max": Number,
    "weight": Match.Optional(Object),
    "weight.min": Number,
    "weight.max": Number
  });

  let shopAdmin;
  // TODO this limit has another meaning now. We should calculate only objects
  // with type="simple", but we need to get all types for additional images
  const limit = productScrollLimit || 10;
  const shop = ReactionCore.getCurrentShop();
  let sort = { title: 1 };

  if (typeof shop !== "object") {
    return this.ready();
  }

  let selector = {
    shopId: shop._id,
    type: "simple"
  };

    if (productFilters) {
      // handle multiple shops
      if (productFilters.shops) {
        _.extend(selector, {shopId: {$in: productFilters.shops}});

      // check if this user is a shopAdmin
      for (let thisShopId of productFilters.shops) {
        if (Roles.userIsInRole(this.userId, ["admin", "createProduct"],
          thisShopId)) {
          shopAdmin = true;
        }
      }
    }

      // filter by tag
      if (productFilters.tag) {
        _.extend(selector, {hashtags: {$in: [productFilters.tag]}});
      }

      // filter by query
      if (productFilters.query) {
        let cond = {$regex: productFilters.query, $options: "i"};
        _.extend(selector, {$or: [{title: cond}, {pageTitle: cond}, {description: cond}]});
      }

      // filter by details
      if (productFilters.details) {
        _.extend(selector, {metafields: {$elemMatch: {key: {$regex: productFilters.details.key, $options: "i"},
          value: {$regex: productFilters.details.value, $options: "i"}}}});
      }

      // filter by visibility
      if (productFilters.visibility !== undefined) {
        _.extend(selector, {isVisible: productFilters.visibility});
      }

      // filter by price
      if (productFilters.price) {
        _.extend(selector, {variants: {$elemMatch: {price: {$gte: productFilters.price.min,
          $lte: productFilters.price.max}}}});
      }

      // filter by weight
      if (productFilters.weight) {
        _.extend(selector, {variants: {$elemMatch: {weight: {$gte: productFilters.weight.min,
          $lte: productFilters.weight.max}}}});
      }
    }

  // products are always visible to owners
  if (!(Roles.userIsInRole(this.userId, ["owner"], shop._id) || shopAdmin)) {
    selector.isVisible = true;
  }

  // TODO: What is this for?
  // Counts.publish(this, "Products", Products.find(selector), {noReady: true});
  return ReactionCore.Collections.Products.find(selector, {
    sort: sort,
    limit: limit
  });
});

/**
 * product detail publication
 * @param {String} productId - productId or handle
 * @return {Object} return product cursor
 */
Meteor.publish("Product", function (productId) {
  check(productId, Match.OptionalOrNull(String));
  if (!productId) {
    ReactionCore.Log.info("ignoring null request on Product subscription");
    return this.stop();
  }
  let _id;
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
    // TODO try/catch here because we can have product handle passed by such regex
    _id = productId;
  } else {
    selector.handle = {
      $regex: productId,
      $options: "i"
    };
    const products = ReactionCore.Collections.Products.find(selector).fetch();
    if (products.length > 0) {
      _id = products[0]._id;
    } else {
      return this.ready();
    }
  }
  selector = { $or: [{ _id: _id }, { ancestors: { $in: [_id] }}] };

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
