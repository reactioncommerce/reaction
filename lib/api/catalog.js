import _ from "lodash";
import { Products } from "/lib/collections";

/**
 * @file Catalog methods
 *
 * @namespace Catalog
 */

export default {
  /**
   * @method getProductPriceRange
   * @memberof Catalog
   * @summary get price range of a product
   * if only one price available, return it
   * otherwise return a string range
   * @todo move all this methods this to export function after 1.3
   * @param {String} [productId] - current product _id
   * @return {Object} range, min, max
   */
  getProductPriceRange(productId) {
    const product = Products.findOne(productId);
    if (!product) {
      return {
        range: "0",
        min: 0,
        max: 0
      };
    }

    const variants = this.getTopVariants(product._id);
    // if we have variants we have a price range.
    // this processing will default on the server
    const visibileVariant = variants.filter((variant) => variant.isVisible === true);

    if (visibileVariant.length > 0) {
      const variantPrices = [];
      variants.forEach((variant) => {
        if (variant.isVisible === true) {
          const range = this.getVariantPriceRange(variant._id);
          if (typeof range === "string") {
            const firstPrice = parseFloat(range.substr(0, range.indexOf(" ")));
            const lastPrice = parseFloat(range.substr(range.lastIndexOf(" ") + 1));
            variantPrices.push(firstPrice, lastPrice);
          } else {
            variantPrices.push(range);
          }
        } else {
          variantPrices.push(0, 0);
        }
      });
      const priceMin = _.min(variantPrices);
      const priceMax = _.max(variantPrices);
      let priceRange = `${priceMin.toFixed(2)} - ${priceMax.toFixed(2)}`;
      // if we don't have a range
      if (priceMin === priceMax) {
        priceRange = priceMin.toFixed(2);
      }
      return {
        range: priceRange,
        min: priceMin,
        max: priceMax
      };
    }

    if (!product.price) {
      return {
        range: "0",
        min: 0,
        max: 0
      };
    }

    // if we have no variants subscribed to (client)
    // we'll get the price object previously from the product
    return product.price;
  },

  /**
   * @method getVariantPriceRange
   * @memberof Catalog
   * @summary get price range of a variant if it has child options.
   * if no child options, return main price value
   * @todo remove string return and replace with object
   * @param {String} [variantId] - current variant _Id
   * @return {String} formatted price or price range
   */
  getVariantPriceRange(variantId) {
    const children = this.getVariants(variantId);
    const visibleChildren = children.filter((child) => child.isVisible);

    switch (visibleChildren.length) {
      case 0: {
        const topVariant = Products.findOne(variantId);
        // topVariant could be undefined when we removing last top variant
        return topVariant && topVariant.price;
      }
      case 1: {
        return visibleChildren[0].price;
      }
      default: {
        let priceMin = Number.POSITIVE_INFINITY;
        let priceMax = Number.NEGATIVE_INFINITY;

        children.forEach((child) => {
          if (child.isVisible === true) {
            if (child.price < priceMin) {
              priceMin = child.price;
            }
            if (child.price > priceMax) {
              priceMax = child.price;
            }
          }
        });

        if (priceMin === priceMax) {
          // TODO check impact on i18n/formatPrice from moving return to string
          return priceMin.toString();
        }
        return `${priceMin} - ${priceMax}`;
      }
    }
  },

  /**
   * @method getVariantQuantity
   * @memberof Catalog
   * @description calculate a sum of descendants `inventoryQuantity`
   * @param {Object} variant - top-level variant
   * @return {Number} summary of options quantity
   */
  getVariantQuantity(variant) {
    const options = this.getVariants(variant._id);
    if (options && options.length) {
      return options.reduce((sum, option) => sum + parseInt(option.inventoryQuantity, 10) || 0, 0);
    }
    return variant.inventoryQuantity || 0;
  },

  /**
   * @method getVariants
   * @memberof Catalog
   * @description Get all parent variants
   * @summary could be useful for products and for top level variants
   * @param {String} [id] - product _id
   * @param {String} [type] - type of variant
   * @return {Array} Parent variants or empty array
   */
  getVariants(id, type) {
    return Products.find({
      ancestors: { $in: [id] },
      type: type || "variant"
    }).fetch();
  },

  /**
   * @method getTopVariants
   * @memberof Catalog
   * @description Get only product top level variants
   * @param {String} [id] - product _id
   * @return {Array} Product top level variants or empty array
   */
  getTopVariants(id) {
    return Products.find({
      ancestors: [id],
      type: "variant"
    }).fetch();
  }
};
