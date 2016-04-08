//
// define search filters as a schema so we can validate
// params supplied to the products publication
//
const filters = new SimpleSchema({
  "shops": {
    type: [String],
    optional: true
  },
  "tags": {
    type: [String],
    optional: true
  },
  "query": {
    type: String,
    optional: true
  },
  "visibility": {
    type: Boolean,
    optional: true
  },
  "details": {
    type: Object,
    optional: true
  },
  "details.key": {
    type: String,
    optional: true
  },
  "details.value": {
    type: String,
    optional: true
  },
  "price": {
    type: Object,
    optional: true
  },
  "price.min": {
    type: Number,
    decimal: true,
    optional: true
  },
  "price.max": {
    type: Number,
    decimal: true,
    optional: true
  },
  "weight": {
    type: Object,
    optional: true
  },
  "weight.min": {
    type: Number,
    optional: true
  },
  "weight.max": {
    type: Number,
    optional: true
  }
});

/**
 * products publication
 * @param {Number} productScrollLimit - optional, defaults to 24
 * @param {Array} shops - array of shopId to retrieve product from.
 * @return {Object} return product cursor
 */
Meteor.publish("Products", function (productScrollLimit = 24, productFilters, sort = {}) {
  check(productScrollLimit, Number);
  check(productFilters, Match.OneOf(undefined, filters));
  check(sort, Match.OneOf(undefined, Object));

  let shopAdmin;
  const shop = ReactionCore.getCurrentShop();
  const Products = ReactionCore.Collections.Products;

  if (typeof shop !== "object") {
    return this.ready();
  }

  if (shop) {
    let selector = {
      ancestors: {
        $exists: true,
        $eq: []
      },
      shopId: shop._id
    };

    if (productFilters) {
      // handle multiple shops
      if (productFilters.shops) {
        _.extend(selector, {
          shopId: {
            $in: productFilters.shops
          }
        });

        // check if this user is a shopAdmin
        for (let thisShopId of productFilters.shops) {
          if (Roles.userIsInRole(this.userId, ["admin", "createProduct"], thisShopId)) {
            shopAdmin = true;
          }
        }
      }

      // filter by tags
      if (productFilters.tags) {
        _.extend(selector, {
          hashtags: {
            $in: productFilters.tags
          }
        });
      }

      // filter by query
      if (productFilters.query) {
        let cond = {
          $regex: productFilters.query,
          $options: "i"
        };
        _.extend(selector, {
          $or: [{
            title: cond
          }, {
            pageTitle: cond
          }, {
            description: cond
          }]
        });
      }

      // filter by details
      if (productFilters.details) {
        _.extend(selector, {
          metafields: {
            $elemMatch: {
              key: {
                $regex: productFilters.details.key,
                $options: "i"
              },
              value: {
                $regex: productFilters.details.value,
                $options: "i"
              }
            }
          }
        });
      }

      // filter by visibility
      if (productFilters.visibility !== undefined) {
        _.extend(selector, {
          isVisible: productFilters.visibility
        });
      }

      if (productFilters.price) {
        let filter = {};
        if (productFilters.price.max) {
          filter["price.min"] = {
            $lte: parseFloat(productFilters.price.max)
          };
        }
        if (productFilters.price.min) {
          filter["price.max"] = {
            $gte: parseFloat(productFilters.price.min)
          };
        }
        _.extend(selector, filter);
      }

      if (productFilters.weight) {
        let filter = {};
        if (productFilters.weight.min) {
          filter.$gte = parseFloat(productFilters.weight.min);
        }
        if (productFilters.weight.max) {
          filter.$lte = parseFloat(productFilters.weight.max);
        }
        const products = Products.find({
          ancestors: {
            $exists: true,
            $ne: []
          },
          shopId: shop._id,
          type: "variant",
          weight: filter
        }, {
          fields: {
            ancestors: 1,
            _id: 0
          }
        }).fetch();
        _.extend(selector, {
          _id: {
            $in: products.map((p) => p.ancestors[0])
          }
        });
      }
    }

    // products are always visible to owners
    if (!(Roles.userIsInRole(this.userId, ["owner"], shop._id) || shopAdmin)) {
      selector.isVisible = true;
    }

    //ReactionCore.Log.debug("Products publication limit", productScrollLimit);
    //ReactionCore.Log.debug("Products publication selector", EJSON.stringify(selector));

    Counts.publish(this, "Products", Products.find(selector), {noReady: true});
    return Products.find(selector, {
      sort: sort,
      limit: productScrollLimit
    });
  }
});
