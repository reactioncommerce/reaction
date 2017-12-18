import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Products, Shops, Revisions } from "/lib/collections";
import { Reaction, Logger } from "/server/api";
import { RevisionApi } from "/imports/plugins/core/revisions/lib/api/revisions";
import { findProductMedia } from "./product";
import { registerSchema } from "@reactioncommerce/reaction-collections";

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

registerSchema("filters", filters);

/**
 * products publication
 * @param {Number} [productScrollLimit] - optional, defaults to 24
 * @param {Array} shops - array of shopId to retrieve product from.
 * @return {Object} return product cursor
 */
Meteor.publish("Products", function (productScrollLimit = 24, productFilters, sort = {}, editMode = true) {
  check(productScrollLimit, Number);
  check(productFilters, Match.OneOf(undefined, Object));
  check(sort, Match.OneOf(undefined, Object));
  check(editMode, Match.Maybe(Boolean));

  // TODO: Consider publishing the non-admin publication if a user is not in "edit mode" to see what is published

  // Active shop
  const shopId = Reaction.getShopId();
  const primaryShopId = Reaction.getPrimaryShopId();

  // Get a list of shopIds that this user has "createProduct" permissions for (owner permission is checked by default)
  const userAdminShopIds = Reaction.getShopsWithRoles(["createProduct"], this.userId);

  // Don't publish if we're missing an active or primary shopId
  if (!shopId || !primaryShopId) {
    return this.ready();
  }

  // Get active shop id's to use for filtering
  const activeShopsIds = Shops.find({
    $or: [
      { "workflow.status": "active" },
      { _id: Reaction.getPrimaryShopId() }
    ]
  }).fetch().map(activeShop => activeShop._id);

  // if there are filter/params that don't match the schema
  // validate, catch except but return no results
  try {
    check(productFilters, Match.OneOf(undefined, filters));
  } catch (e) {
    Logger.debug(e, "Invalid Product Filters");
    return this.ready();
  }

  const shopIdsOrSlugs = productFilters && productFilters.shops;

  if (shopIdsOrSlugs) {
    // Get all shopIds associated with the slug or Id
    const shopIds = Shops.find({
      $or: [{
        _id: {
          $in: shopIdsOrSlugs
        }
      }, {
        slug: {
          $in: shopIdsOrSlugs
        }
      }]
    }).map((shop) => shop._id);

    // If we found shops, update the productFilters
    if (shopIds) {
      productFilters.shops = shopIds;
    } else {
      return this.ready();
    }
  }

  // Init default selector - Everyone can see products that fit this selector
  const selector = {
    ancestors: [], // Lookup top-level products
    isDeleted: { $in: [null, false] }, // by default, we don't publish deleted products
    isVisible: true // by default, only lookup visible products
  };

  if (productFilters) {
    // handle multiple shops
    if (productFilters.shops) {
      _.extend(selector, {
        $or: [{
          shopId: {
            $in: productFilters.shops
          }
        }, {
          slug: {
            $in: productFilters.shops
          }
        }]
      });
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
  } // end if productFilters


  // We publish an admin version of this publication to admins of products who are in "Edit Mode"
  // Authorized content curators for shops get special publication of the product
  // with all relevant revisions all is one package
  // userAdminShopIds is a list of shopIds that the user has createProduct or owner access for
  if (editMode && userAdminShopIds && Array.isArray(userAdminShopIds) && userAdminShopIds.length > 0) {
    selector.isVisible = {
      $in: [true, false, null, undefined]
    };
    selector.shopId = {
      $in: activeShopsIds
    };

    // Get _ids of top-level products
    const productIds = Products.find(selector, {
      sort: sort,
      limit: productScrollLimit
    }).map(product => product._id);

    let newSelector = selector;

    // Remove hashtag filter from selector (hashtags are not applied to variants, we need to get variants)
    if (productFilters && productFilters.tags) {
      newSelector = _.omit(selector, ["hashtags", "ancestors"]);

      // Re-configure selector to pick either Variants of one of the top-level products, or the top-level products in the filter
      _.extend(newSelector, {
        $or: [{
          ancestors: {
            $in: productIds
          }
        }, {
          $and: [{
            hashtags: {
              $in: productFilters.tags
            }
          }, {
            _id: {
              $in: productIds
            }
          }]
        }]
      });
    } else {
      newSelector = _.omit(selector, ["hashtags", "ancestors"]);
      _.extend(newSelector, {
        $or: [{
          ancestors: {
            $in: productIds
          }
        }, {
          _id: {
            $in: productIds
          }
        }]
      });
    }

    if (RevisionApi.isRevisionControlEnabled()) {
      const productCursor = Products.find(newSelector);
      const handle = productCursor.observeChanges({
        added: (id, fields) => {
          const revisions = Revisions.find({
            "$or": [
              { documentId: id },
              { parentDocument: id }
            ],
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
            "$or": [
              { documentId: id },
              { parentDocument: id }
            ],
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
          let product;
          if (!revision.documentType || revision.documentType === "product") {
            product = Products.findOne(revision.documentId);
          } else if (revision.documentType === "image" || revision.documentType === "tag") {
            product = Products.findOne(revision.parentDocument);
          }

          if (product) {
            this.added("Products", product._id, product);
            this.added("Revisions", revision._id, revision);
          }
        },
        changed: (revision) => {
          let product;
          if (!revision.documentType || revision.documentType === "product") {
            product = Products.findOne(revision.documentId);
          } else if (revision.documentType === "image" || revision.documentType === "tag") {
            product = Products.findOne(revision.parentDocument);
          }
          if (product) {
            product.__revisions = [revision];
            this.changed("Products", product._id, product);
            this.changed("Revisions", revision._id, revision);
          }
        },
        removed: (revision) => {
          let product;

          if (!revision.documentType || revision.documentType === "product") {
            product = Products.findOne(revision.documentId);
          } else if (revision.docuentType === "image" || revision.documentType === "tag") {
            product = Products.findOne(revision.parentDocument);
          }
          if (product) {
            product.__revisions = [];
            this.changed("Products", product._id, product);
            this.removed("Revisions", revision._id, revision);
          }
        }
      });


      this.onStop(() => {
        handle.stop();
        handle2.stop();
      });

      const mediaProductIds = productCursor.fetch().map((p) => p._id);
      const mediaCursor = findProductMedia(this, mediaProductIds);

      return [
        mediaCursor
      ];
    }
    // Revision control is disabled, but is admin
    const productCursor = Products.find(newSelector, {
      sort: sort,
      limit: productScrollLimit
    });
    const mediaProductIds = productCursor.fetch().map((p) => p._id);
    const mediaCursor = findProductMedia(this, mediaProductIds);

    return [
      productCursor,
      mediaCursor
    ];
  }

  // This is where the publication begins for non-admin users
  // Get _ids of top-level products
  const productIds = Products.find(selector, {
    sort: sort,
    limit: productScrollLimit
  }).map(product => product._id);

  let newSelector = { ...selector };

  // Remove hashtag filter from selector (hashtags are not applied to variants, we need to get variants)
  if (productFilters && Object.keys(productFilters).length === 0 && productFilters.constructor === Object) {
    newSelector = _.omit(selector, ["hashtags", "ancestors"]);

    if (productFilters.tags) {
      // Re-configure selector to pick either Variants of one of the top-level products,
      // or the top-level products in the filter
      _.extend(newSelector, {
        $or: [{
          ancestors: {
            $in: productIds
          }
        }, {
          $and: [{
            hashtags: {
              $in: productFilters.tags
            }
          }, {
            _id: {
              $in: productIds
            }
          }]
        }]
      });
    }
    // filter by query
    if (productFilters.query) {
      const cond = {
        $regex: productFilters.query,
        $options: "i"
      };
      _.extend(newSelector, {
        $or: [{
          title: cond
        }, {
          pageTitle: cond
        }, {
          description: cond
        }, {
          ancestors: {
            $in: productIds
          }
        },
        {
          _id: {
            $in: productIds
          }
        }]
      });
    }
  } else {
    newSelector = _.omit(selector, ["hashtags", "ancestors"]);

    _.extend(newSelector, {
      $or: [{
        ancestors: {
          $in: productIds
        }
      }, {
        _id: {
          $in: productIds
        }
      }]
    });
  }

  // Adjust the selector to include only active shops
  newSelector = {
    ...newSelector,
    shopId: {
      $in: activeShopsIds
    }
  };

  // Returning Complete product tree for top level products to avoid sold out warning.
  const productCursor = Products.find(newSelector, {
    sort: sort
    // TODO: REVIEW Limiting final products publication for non-admins
    // I think we shouldn't limit here, otherwise we are limited to 24 total products which
    // could be far less than 24 top-level products
    // limit: productScrollLimit
  });

  const mediaProductIds = productCursor.fetch().map((p) => p._id);
  const mediaCursor = findProductMedia(this, mediaProductIds);

  return [
    productCursor,
    mediaCursor
  ];
});
