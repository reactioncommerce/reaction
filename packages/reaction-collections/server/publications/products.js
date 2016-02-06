/**
 * products publication
 * @param {Number} productScrollLimit - optional, defaults to 20
 * @param {Array} shops - array of shopId to retrieve product from.
 * @return {Object} return product cursor
 */
Meteor.publish("Products", function (productScrollLimit, productFilters) {
  check(productScrollLimit, Match.OneOf(null, undefined, Number));
  check(productFilters, Match.OneOf(null, undefined, Object));

  let shopAdmin;
  let shop = ReactionCore.getCurrentShop();
  if (typeof shop !== "object") {
    return this.ready();
  }
  let Products = ReactionCore.Collections.Products;
  let limit = productScrollLimit || 10;
  let sort = {title: 1};

  if (shop) {
    let selector = {shopId: shop._id};

    if (productFilters) {
      // handle multiple shops
      if (productFilters.shops) {
        check(productFilters.shops, Array);
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
        check(productFilters.tag, String);
        _.extend(selector, {hashtags: {$in: [productFilters.tag]}});
      }

      // filter by query
      if (productFilters.query) {
        check(productFilters.query, String);
        let cond = {$regex: productFilters.query, $options: 'i'};
        _.extend(selector, {$or: [{'title': cond}, {'pageTitle': cond}, {'description': cond}]});
      }

      // filter by details
      if (productFilters.details) {
        check(productFilters.details, Object);
        _.extend(selector, {metafields: {$elemMatch: {key: {$regex: productFilters.details.key, $options: 'i'},
          value: {$regex: productFilters.details.value, $options: 'i'}}}});
      }

      // filter by visibility
      if (productFilters.visibility !== undefined) {
        check(productFilters.visibility, Boolean);
        _.extend(selector, {'isVisible': productFilters.visibility});
      }

      // filter by price
      if (productFilters.price) {
        check(productFilters.price, Object);
        _.extend(selector, {variants: {$elemMatch: {price: {$gte: productFilters.price.min,
          $lte: productFilters.price.max}}}});
      }

      // filter by weight
      if (productFilters.weight) {
        check(productFilters.weight, Object);
        _.extend(selector, {variants: {$elemMatch: {weight: {$gte: productFilters.weight.min,
          $lte: productFilters.weight.max}}}});
      }

    }

    // products are always visible to owners
    if (!(Roles.userIsInRole(this.userId, ["owner"], shop._id) || shopAdmin)) {
      selector.isVisible = true;
    }

    Counts.publish(this, 'Products', Products.find(selector), {noReady: true});
    return Products.find(selector, {
      sort: sort,
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
  if (typeof shop !== "object") {
    return this.ready();
  }
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
  const shopId = ReactionCore.getShopId();
  if (!shopId) {
    return this.ready();
  }
  return ReactionCore.Collections.Tags.find({
    shopId: shopId
  });
});
