import SimpleSchema from "simpl-schema";

const dateRangeFilter = new SimpleSchema({
  start: {
    type: Date,
    optional: false
  },
  end: {
    type: Date,
    optional: false
  }
});

const dateFilter = new SimpleSchema({
  eq: {
    type: Date,
    optional: true
  },
  before: {
    type: Date,
    optional: true
  },
  after: {
    type: Date,
    optional: true
  },
  between: {
    type: dateRangeFilter,
    optional: true
  }
});

const filters = new SimpleSchema({
  "createdAt": {
    type: dateFilter,
    optional: true
  },
  "updatedAt": {
    type: dateFilter,
    optional: true
  },
  "productIds": {
    type: Array,
    optional: true
  },
  "productIds.$": String,
  "shopIds": {
    type: Array,
    optional: true
  },
  "shopIds.$": String,
  "tagIds": {
    type: Array,
    optional: true
  },
  "tagIds.$": String,
  "query": {
    type: String,
    optional: true
  },
  "isArchived": {
    type: Boolean,
    optional: true
  },
  "isVisible": {
    type: Boolean,
    optional: true
  },
  "metafieldKey": {
    type: String,
    optional: true
  },
  "metafieldValue": {
    type: String,
    optional: true
  },
  "priceMin": {
    type: Number,
    optional: true
  },
  "priceMax": {
    type: Number,
    optional: true
  },
  "isExactMatch": {
    type: Boolean,
    optional: true,
    defaultValue: false
  }
});

/**
 * @name applyProductFilters
 * @summary Builds a selector for Products collection, given a set of filters
 * @private
 * @param {Object} context - an object containing the per-request state
 * @param {Object} productFilters - See filters schema above
 * @returns {Object} Selector
 */
export default function applyProductFilters(context, productFilters) {
  // if there are filter/params that don't match the schema
  filters.validate(productFilters);

  // Init default selector - Everyone can see products that fit this selector
  let selector = {
    ancestors: [], // Lookup top-level products
    isDeleted: { $ne: true } // by default, we don't publish deleted products
  };

  if (productFilters) {
    // Filter by createdAt
    if (productFilters.createdAt) {
      const createdAtSelectors = [];
      if (productFilters.createdAt.eq) {
        createdAtSelectors.push({
          createdAt: productFilters.createdAt.eq
        });
      }
      if (productFilters.createdAt.before) {
        createdAtSelectors.push({
          createdAt: {
            $lt: productFilters.createdAt.before
          }
        });
      }
      if (productFilters.createdAt.after) {
        createdAtSelectors.push({
          createdAt: {
            $gt: productFilters.createdAt.after
          }
        });
      }
      if (productFilters.createdAt.between) {
        const { start, end } = productFilters.createdAt.between;
        createdAtSelectors.push({
          createdAt: {
            $gte: start,
            $lte: end
          }
        });
      }
      if (createdAtSelectors.length) {
        selector.$and = [...(selector.$and || []), ...createdAtSelectors];
      }
    }

    // Filter by updatedAt
    if (productFilters.updatedAt) {
      const updatedAtSelectors = [];
      if (productFilters.updatedAt.eq) {
        updatedAtSelectors.push({
          updatedAt: productFilters.updatedAt.eq
        });
      }
      if (productFilters.updatedAt.before) {
        updatedAtSelectors.push({
          updatedAt: {
            $lt: productFilters.updatedAt.before
          }
        });
      }
      if (productFilters.updatedAt.after) {
        updatedAtSelectors.push({
          updatedAt: {
            $gt: productFilters.updatedAt.after
          }
        });
      }
      if (productFilters.updatedAt.between) {
        const { start, end } = productFilters.updatedAt.between;
        updatedAtSelectors.push({
          updatedAt: {
            $gte: start,
            $lte: end
          }
        });
      }
      if (updatedAtSelectors.length) {
        selector.$and = [...(selector.$and || []), ...updatedAtSelectors];
      }
    }

    // filter by productIds
    if (productFilters.productIds) {
      selector = {
        ...selector,
        _id: {
          $in: productFilters.productIds
        }
      };
    }

    if (productFilters.shopIds) {
      selector = {
        ...selector,
        shopId: {
          $in: productFilters.shopIds
        }
      };
    }

    // filter by tags
    if (productFilters.tagIds) {
      selector = {
        ...selector,
        hashtags: {
          $in: productFilters.tagIds
        }
      };
    }

    // filter by query
    if (productFilters.query) {
      const cond = {
        $regex: productFilters.query,
        $options: "i"
      };
      selector = {
        ...selector,
        $or: [{
          title: cond
        }, {
          pageTitle: cond
        }, {
          description: cond
        }]
      };
    }

    // filter by details
    if (productFilters.metafieldKey && productFilters.metafieldValue) {
      let keyCondition;
      let valueCondition;

      // Set the search condition based on isFuzzySearch flag
      if (productFilters.isExactMatch) {
        keyCondition = productFilters.metafieldKey;
        valueCondition = productFilters.metafieldValue;
      } else {
        keyCondition = {
          $regex: productFilters.metafieldKey,
          $options: "i"
        };
        valueCondition = {
          $regex: productFilters.metafieldValue,
          $options: "i"
        };
      }

      selector = {
        ...selector,
        metafields: {
          $elemMatch: {
            key: keyCondition,
            value: valueCondition
          }
        }
      };
    }

    // filter by visibility
    if (productFilters.isVisible !== undefined) {
      selector = {
        ...selector,
        isVisible: productFilters.isVisible
      };
    }

    // filter by archived
    if (productFilters.isArchived !== undefined) {
      selector = {
        ...selector,
        isDeleted: productFilters.isArchived
      };
    }

    // filter by gte minimum price
    if (productFilters.priceMin && !productFilters.priceMax) {
      selector = {
        ...selector,
        "price.min": {
          $gte: parseFloat(productFilters.priceMin)
        }
      };
    }

    // filter by lte maximum price
    if (productFilters.priceMax && !productFilters.priceMin) {
      selector = {
        ...selector,
        "price.max": {
          $lte: parseFloat(productFilters.priceMax)
        }
      };
    }

    // filter with a price range
    if (productFilters.priceMin && productFilters.priceMax) {
      const priceMin = parseFloat(productFilters.priceMin);
      const priceMax = parseFloat(productFilters.priceMax);

      // Filters a whose min and max price range are within the
      // range supplied from the filter
      selector = {
        ...selector,
        "price.min": {
          $gte: priceMin
        },
        "price.max": {
          $lte: priceMax
        }
      };
    }
  } // end if productFilters

  return selector;
}
