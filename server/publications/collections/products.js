import { Products, Revisions } from "/lib/collections";
import { Reaction } from "/server/api";
import { RevisionApi } from "/imports/plugins/core/revisions/lib/api/revisions";

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
    type: String,
    optional: true
  },
  "price.max": {
    type: String,
    optional: true
  },
  "weight": {
    type: Object,
    optional: true
  },
  "weight.min": {
    type: String,
    optional: true
  },
  "weight.max": {
    type: String,
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

  const shop = Reaction.getCurrentShop();

  if (typeof shop !== "object") {
    return this.ready();
  }

  if (shop) {
    const selector = {
      isDeleted: {$in: [null, false]},
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
        for (const thisShopId of productFilters.shops) {
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
        const cond = {
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

      // filter by gte minimum price
      if (productFilters["price.min"] && !productFilters["price.max"]) {
        _.extend(selector, {
          "price.min": {
            $gte: parseFloat(productFilters["price.min"])
          }
        });
      }

      // filter by lte maximum price
      if (productFilters["price.max"] && !productFilters["price.min"]) {
        _.extend(selector, {
          "price.max": {
            $lte: parseFloat(productFilters["price.max"])
          }
        });
      }

      // filter with a price range
      if (productFilters["price.min"] && productFilters["price.max"]) {
        const pmin = parseFloat(productFilters["price.min"]);
        const pmax = parseFloat(productFilters["price.max"]);
        // where product A has min 12.99 variant and a 19.99 variant
        // price.min=12.99&price.max=19.98
        // should return product A
        _.extend(selector, {
          "price.min": {
            $lt: pmax
          },
          "price.max": {
            $gt: pmin
          }
        });
      }

      // filter by gte minimum weight
      if (productFilters["weight.min"] && !productFilters["weight.max"]) {
        _.extend(selector, {
          weight: {
            $gte: parseFloat(productFilters["weight.min"])
          }
        });
      }

      // filter by lte maximum weight
      if (productFilters["weight.max"] && !productFilters["weight.min"]) {
        _.extend(selector, {
          weight: {
            $lte: parseFloat(productFilters["weight.max"])
          }
        });
      }

      // filter with a weight range
      if (productFilters["weight.min"] && productFilters["weight.max"]) {
        const wmin = parseFloat(productFilters["weight.min"]);
        const wmax = parseFloat(productFilters["weight.max"]);
        _.extend(selector, {
          weight: {
            $lt: wmax,
            $gt: wmin
          }
        });
      }
    }

    // Authorized content curators fo the shop get special publication of the product
    // all all relevant revisions all is one package

    if (Roles.userIsInRole(this.userId, ["owner", "admin", "createProduct"], shop._id)) {
      selector.isVisible = {
        $in: [true, false, undefined]
      };

      if (RevisionApi.isRevisionControlEnabled()) {
        const handle = Products.find(selector, {
          sort: sort,
          limit: productScrollLimit
        }).observeChanges({
          added: (id, fields) => {
            const revisions = Revisions.find({
              "documentId": id,
              "workflow.status": {
                $nin: [
                  "revision/published"
                ]
              }
            }).fetch();
            fields.__revisions = revisions;

            this.added("Products", id, fields);
          },
          changed: (id, fields) => {
            const revisions = Revisions.find({
              "documentId": id,
              "workflow.status": {
                $nin: [
                  "revision/published"
                ]
              }
            }).fetch();

            fields.__revisions = revisions;
            this.changed("Products", id, fields);
          },
          removed: (id) => {
            this.removed("Products", id);
          }
        });

        const handle2 = Revisions.find({
          "workflow.status": {
            $nin: [
              "revision/published"
            ]
          }
        }).observe({
          added: (revision) => {
            this.added("Revisions", revision._id, revision);
          },
          changed: (revision) => {
            const product = Products.findOne(revision.documentId);

            product.__revisions = [revision];

            this.changed("Products", product._id, product);
            this.changed("Revisions", revision._id, revision);
          },
          removed: (revision) => {
            const product = Products.findOne(revision.documentId);
            product.__revisions = [];

            this.changed("Products", product._id, product);
            this.removed("Revisions", revision._id, revision);
          }
        });


        this.onStop(() => {
          handle.stop();
          handle2.stop();
        });

        return this.ready();
      }
      // Revision control is disabled
      return Products.find(selector, {
        sort: sort,
        limit: productScrollLimit
      });
    }

    // Everyone else gets the standard, visibile products
    selector.isVisible = true;

    return Products.find(selector, {
      sort: sort,
      limit: productScrollLimit
    });
  }
});
