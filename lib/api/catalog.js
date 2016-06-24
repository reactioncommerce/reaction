import { Products } from "/lib/collections";

export default Catalog = {
  /**
   * setProduct
   * @summary method to set default/parameterized product variant
   * @param {String} currentProductId - set current productId
   * @param {String} currentVariantId - set current variantId
   * @return {undefined} return nothing, sets in session
   */
  setProduct(currentProductId, currentVariantId) {
    let productId = currentProductId;
    let variantId = currentVariantId;
    if (!productId.match(/^[A-Za-z0-9]{17}$/)) {
      let product = Products.findOne({
        handle: productId.toLowerCase()
      });
      if (product) {
        productId = product._id;
      }
    }
    setCurrentProduct(productId);
    setCurrentVariant(variantId);
  },

  /**
   * getProductPriceRange
   * @summary get price range of a product
   * if no only one price available, return it
   * otherwise return a string range
   * @todo remove string return and replace with object
   * @todo move all this methods this to export function after 1.3
   * @param {String} [productId] - current product _id
   * @return {Object} range, min, max
   */
  getProductPriceRange(productId) {
    const product = Products.findOne(productId);
    if (!product) {
      return "";
    }
    const variants = this.getTopVariants(product._id);
    // if we have variants we have a price range.
    // this processing will default on the server
    if (variants.length > 0) {
      let variantPrices = [];
      variants.forEach(variant => {
        let range = this.getVariantPriceRange(variant._id);
        if (typeof range === "string") {
          let firstPrice = parseFloat(range.substr(0, range.indexOf(" ")));
          let lastPrice = parseFloat(range.substr(range.lastIndexOf(" ") + 1));
          variantPrices.push(firstPrice, lastPrice);
        } else {
          variantPrices.push(range);
        }
      });
      let priceMin = _.min(variantPrices);
      let priceMax = _.max(variantPrices);
      let priceRange = `${priceMin} - ${priceMax}`;
      // if we don't have a range
      if (priceMin === priceMax) {
        priceRange = priceMin.toString();
      }
      const priceObject = {
        range: priceRange,
        min: priceMin,
        max: priceMax
      };
      return priceObject;
    }
    // if we have no variants subscribed to (client)
    // we'll get the price object previously from the product
    return product.price;
  },

  /**
   * getVariantPriceRange
   * @summary get price range of a variant if it has child options.
   * if no child options, return main price value
   * @todo remove string return and replace with object
   * @param {String} [variantId] - current variant _Id
   * @return {String} formatted price or price range
   */
  getVariantPriceRange(variantId) {
    const children = this.getVariants(variantId);

    switch (children.length) {
    case 0:
      const topVariant = Products.findOne(variantId);
      // topVariant could be undefined when we removing last top variant
      return topVariant && topVariant.price;
    case 1:
      return children[0].price;
    default:
      let priceMin = Number.POSITIVE_INFINITY;
      let priceMax = Number.NEGATIVE_INFINITY;

      children.map(child => {
        if (child.price < priceMin) {
          priceMin = child.price;
        }
        if (child.price > priceMax) {
          priceMax = child.price;
        }
      });

      if (priceMin === priceMax) {
        // TODO check impact on i18n/formatPrice from moving return to string
        return priceMin.toString();
      }
      return `${priceMin} - ${priceMax}`;
    }
  },

  /**
   * getVariantQuantity
   * @description calculate a sum of descendants `inventoryQuantity`
   * @param {Object} variant - top-level variant
   * @return {Number} summary of options quantity
   */
  getVariantQuantity(variant) {
    const options = this.getVariants(variant._id);
    if (options && options.length) {
      return options.reduce((sum, option) =>
      sum + option.inventoryQuantity || 0, 0);
    }
    return variant.inventoryQuantity || 0;
  },

  /**
   * @method getVariants
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
