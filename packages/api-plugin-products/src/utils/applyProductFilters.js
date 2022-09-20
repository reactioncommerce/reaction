import SimpleSchema from "simpl-schema";

const filters = new SimpleSchema({
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
