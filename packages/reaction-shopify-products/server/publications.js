/**
 * ShopifyProduct detail publication
 * @return {Object} return ShopifyProduct cursor
 */
let ShopifyProducts = ReactionCore.Collections.ShopifyProducts;
let Bundles = ReactionCore.Collections.Bundles;

Meteor.publish('ShopifyProducts/CurrentImport', function () {
  let shop = ReactionCore.getCurrentShop(this);
  if (!Roles.userIsInRole(this.userId, ['owner', 'admin', 'createProduct'], shop._id)) {
    return false;
  }

  return ShopifyProducts.find({}, {sort: {createdAt: -1}, limit: 1});
});

Meteor.publish('ShopifyProducts/Bundles', function () {
  let shop = ReactionCore.getCurrentShop(this);
  if (!Roles.userIsInRole(this.userId, ['owner', 'admin', 'createProduct'], shop._id)) {
    return false;
  }

  return Bundles.find({}, {sort: {title: -1} });
});


/**
 * Bundle detail publication
 * @param {String} productId - productId
 * @return {Object} return product cursor
 */
Meteor.publish('ShopifyProducts/Bundle', function (bundleId) {
  check(bundleId, String);
  let shop = ReactionCore.getCurrentShop(this);
  if (!Roles.userIsInRole(this.userId, ['owner', 'admin', 'createProduct'], shop._id)) {
    return false;
  }
  let selector = {};

  // TODO review for REGEX / DOS vulnerabilities.
  if (bundleId.match(/^[A-Za-z0-9]{17}$/)) {
    selector._id = bundleId;
  } else {
    selector.handle = {
      $regex: bundleId,
      $options: 'i'
    };
  }
  return Bundles.find(selector);
});

/**
 * products jackets publication
 * @param {Number} productScrollLimit - optional, defaults to 20
 * @param {Array} shops - array of shopId to retrieve product from.
 * @return {Object} return product cursor
 */
Meteor.publish('ProductsOfType', function (type) {
  check(type, String);

  let shop = ReactionCore.getCurrentShop(this);
  if (!Roles.userIsInRole(this.userId, ['owner', 'admin', 'createProduct'], shop._id)) {
    return false;
  }
  let selector = {productType: type, shopId: shop._id};
  let Products = ReactionCore.Collections.Products;
  return Products.find(selector, {
    sort: {
      gender: 1,
      vendor: 1
    },
    limit: 30,
    fields: {
      _id: 1,
      vendor: 1,
      gender: 1,
      title: 1,
      productType: 1
    }
  });
});
