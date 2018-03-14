import _ from "lodash";
import SimpleSchema from "simpl-schema";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { check, Match } from "meteor/check";
import { registerSchema } from "@reactioncommerce/reaction-collections";
import { Products, Shops, Revisions, Catalog } from "/lib/collections";
import { Reaction, Logger } from "/server/api";
import { RevisionApi } from "/imports/plugins/core/revisions/lib/api/revisions";

//
// define search filters as a schema so we can validate
// params supplied to the products publication
//
const filters = new SimpleSchema({
  "shops": {
    type: Array,
    optional: true
  },
  "shops.$": String,
  "tags": {
    type: Array,
    optional: true
  },
  "tags.$": String,
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
}, { check, tracker: Tracker });

registerSchema("filters", filters);

/**
 * Broadens an existing selector to include all variants of the given top-level productIds
 * Additionally considers the tags product filter, if given
 * Can operate on the "Revisions" and the "Products" collection
 * @param collectionName {String} - "Revisions" or "Products"
 * @param selector {object} - the selector that should be extended
 * @param productFilters { object } - the product filter (e.g. orginating from query parameters)
 * @param productIds {String[]} - the top-level productIds we want to get the variants of.
 */
function extendSelectorWithVariants(collectionName, selector, productFilters, productIds) {
  let prefix = "";

  if (collectionName.toLowerCase() === "revisions") {
    prefix = "documentData.";
  } else if (collectionName.toLowerCase() !== "products") {
    throw new Error(`Can't extend selector for collection ${collectionName}.`);
  }

  // Remove hashtag filter from selector (hashtags are not applied to variants, we need to get variants)
  const newSelector = _.omit(selector, ["hashtags", "ancestors"]);
  if (productFilters && productFilters.tags) {
    // Re-configure selector to pick either Variants of one of the top-level products, or the top-level products in the filter
    _.extend(newSelector, {
      $or: [{
        [`${prefix}ancestors`]: {
          $in: productIds
        }
      }, {
        $and: [{
          [`${prefix}hashtags`]: {
            $in: productFilters.tags
          }
        }, {
          [`${prefix}_id`]: {
            $in: productIds
          }
        }]
      }]
    });
  } else {
    _.extend(newSelector, {
      $or: [{
        [`${prefix}ancestors`]: {
          $in: productIds
        }
      }, {
        [`${prefix}_id`]: {
          $in: productIds
        }
      }]
    });
  }
  return newSelector;
}

function filterProducts(productFilters) {
  // if there are filter/params that don't match the schema
  // validate, catch except but return no results
  try {
    if (productFilters) filters.validate(productFilters);
  } catch (e) {
    Logger.debug(e, "Invalid Product Filters");
    return false;
  }

  const shopIdsOrSlugs = productFilters && productFilters.shops;

  if (shopIdsOrSlugs) {
    // Get all shopIds associated with the slug or Id
    const shopIds = Shops.find({
      "workflow.status": "active",
      "$or": [{
        _id: { $in: shopIdsOrSlugs }
      }, {
        slug: { $in: shopIdsOrSlugs }
      }]
    }).map((shop) => shop._id);

    // If we found shops, update the productFilters
    if (shopIds) {
      productFilters.shops = shopIds;
    } else {
      return false;
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
        shopId: {
          $in: productFilters.shops
        }
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

  return selector;
}

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
  }).fetch().map((activeShop) => activeShop._id);

  const selector = filterProducts(productFilters);

  if (selector === false) {
    return this.ready();
  }

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
      sort,
      limit: productScrollLimit
    }).map((product) => product._id);


    const productSelectorWithVariants = extendSelectorWithVariants("Products", selector, productFilters, productIds);

    if (RevisionApi.isRevisionControlEnabled()) {
      const revisionSelector = {
        "workflow.status": {
          $nin: [
            "revision/published"
          ]
        }
      };
      const revisionSelectorWithVariants = extendSelectorWithVariants("Revisions", revisionSelector, productFilters, productIds);
      const handle = Revisions.find(revisionSelectorWithVariants).observe({
        added: (revision) => {
          this.added("Revisions", revision._id, revision);
          if (revision.documentType === "product") {
            // Check merge box (session collection view), if product is already in cache.
            // If yes, we send a `changed`, otherwise `added`. I'm assuming
            // that this._documents.Products is somewhat equivalent to
            // the merge box Meteor.server.sessions[sessionId].getCollectionView("Products").documents
            if (this._documents.Products && this._documents.Products[revision.documentId]) {
              this.changed("Products", revision.documentId, { __revisions: [revision] });
            } else {
              this.added("Products", revision.documentId, { __revisions: [revision] });
            }
          }
        },
        changed: (revision) => {
          this.changed("Revisions", revision._id, revision);
          if (revision.documentType === "product") {
            if (this._documents.Products && this._documents.Products[revision.documentId]) {
              this.changed("Products", revision.documentId, { __revisions: [revision] });
            }
          }
        },
        removed: (revision) => {
          this.removed("Revisions", revision._id);
          if (revision.documentType === "product") {
            if (this._documents.Products && this._documents.Products[revision.documentId]) {
              this.changed("Products", revision.documentId, { __revisions: [] });
            }
          }
        }
      });

      this.onStop(() => {
        handle.stop();
      });

      return Products.find(productSelectorWithVariants);
    }

    // Revision control is disabled, but is admin
    return Products.find(productSelectorWithVariants, {
      sort,
      limit: productScrollLimit
    });
  }

  // This is where the publication begins for non-admin users
  // Get _ids of top-level products
  const productIds = Products.find(selector, {
    sort,
    limit: productScrollLimit
  }).map((product) => product._id);

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
  return Products.find(newSelector, {
    sort
    // TODO: REVIEW Limiting final products publication for non-admins
    // I think we shouldn't limit here, otherwise we are limited to 24 total products which
    // could be far less than 24 top-level products
    // limit: productScrollLimit
  });
});

/**
 * @name Products/grid
 * @method
 * @memberof Core
 * @summary Publication method for a customer facing product grid
 * @param {number} productScrollLimit - product find limit
 * @param {object} productFilters - filters to be applied to the product find
 * @param {object} sort - sorting to be applied to the product find
 * @return {MongoCursor} Mongo cursor object of found products
 */
Meteor.publish("Products/grid", function (productScrollLimit = 24, productFilters, sort = {}) {
  check(productScrollLimit, Number);
  check(productFilters, Match.OneOf(undefined, Object));
  check(sort, Match.OneOf(undefined, Object));

  const newSelector = filterProducts(productFilters);

  if (newSelector === false) {
    return this.ready();
  }

  const productCursor = Catalog.find(newSelector, {
    sort,
    limit: productScrollLimit,
    fields: {
      variants: 0
    }
  });

  return productCursor;
});
