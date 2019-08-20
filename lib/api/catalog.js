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
   * @returns {Object} range, min, max
   */
  getProductPriceRange(productId) {
    const product = Products.findOne({ _id: productId });
    if (!product || !product.price) {
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
   * @returns {String} formatted price or price range
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
   * @method getVariants
   * @memberof Catalog
   * @description Get all parent variants
   * @summary could be useful for products and for top level variants
   * @param {String} [id] - product _id
   * @param {String} [type] - type of variant
   * @returns {Array} Parent variants or empty array
   */
  getVariants(id, type) {
    return Products.find({
      ancestors: { $in: [id] },
      type: type || "variant"
    }, {
      sort: {
        index: 1
      }
    }).fetch();
  },

  /**
   * @method getTopVariants
   * @memberof Catalog
   * @description Get only product top level variants
   * @param {String} [id] - product _id
   * @returns {Array} Product top level variants or empty array
   */
  getTopVariants(id) {
    return Products.find({
      ancestors: [id],
      type: "variant"
    }).fetch();
  }
};
