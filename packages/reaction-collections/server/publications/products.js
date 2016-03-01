/**
 * products publication
 * @param {Number} productScrollLimit - optional, defaults to 20
 * @param {Array} shops - array of shopId to retrieve product from.
 * @return {Object} return product cursor
 */
Meteor.publish("Products", function (productScrollLimit, productFilters) {
  check(productScrollLimit, Match.OneOf(null, undefined, Number));
  check(productFilters, Match.OneOf(null, undefined, Object));
  try {
    new SimpleSchema({
      "shops": {type: [String], optional: true},
      "tag": {type: String, optional: true},
      "query": {type: String, optional: true},
      "visibility": {type: Boolean, optional: true},
      "details": {type: Object, optional: true},
      "details.key": {type: String},
      "details.value": {type: String},
      "price": {type: Object, optional: true},
      "price.min": {type: Number},
      "price.max": {type: Number},
      "weight": {type: Object, optional: true},
      "weight.min": {type: Number},
      "weight.max": {type: Number}
    }).validate(productFilters);
  } catch (e) {
    ReactionCore.Log.error(e);
    throw new Meteor.Error(e);
  }

  let shopAdmin;
  const limit = productScrollLimit || 10;
  const shop = ReactionCore.getCurrentShop();
  const Products = ReactionCore.Collections.Products;
  const sort = {title: 1};

  if (typeof shop !== "object") {
    return this.ready();
  }

  if (shop) {
    let selector = {shopId: shop._id};

    if (productFilters) {
      // handle multiple shops
      if (productFilters.shops) {
        _.extend(selector, {shopId: {$in: productFilters.shops}});

        // check if this user is a shopAdmin
        for (let thisShopId of productFilters.shops) {
          if (Roles.userIsInRole(this.userId, ["admin", "createProduct"], thisShopId)) {
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

    ReactionCore.Log.debug("Products publication limit", productScrollLimit);
    ReactionCore.Log.debug("Products publication selector", EJSON.stringify(selector));

    Counts.publish(this, "Products", Products.find(selector), {noReady: true});
    return Products.find(selector, {
      sort: sort,
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
  check(productId, Match.OptionalOrNull(String));
  if (!productId) {
    ReactionCore.Log.info("ignoring null request on Product subscription");
    return this.stop();
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
