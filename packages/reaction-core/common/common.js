
/**
 * Match.OptionalOrNull
 * See Meteor Match methods
 * @param {String} pattern - match pattern
 * @return {Boolen} matches - void, null, or pattern
 */
Match.OptionalOrNull = function (pattern) {
  return Match.OneOf(void 0, null, pattern);
};

/**
 * Match.OrderHookOption
 * See Meteor Match methods
 * @param {Object} pattern - match pattern
 * @return {Boolen} matches - void, null, or pattern
 */
Match.OrderHookOptions = function () {
  return Match.OneOf(Object);
};

/*
 * extend ReactionCore and add common methods
 */
_.extend(ReactionCore, {
  /**
   * ReactionCore.setProduct
   * @summary method to set default/parameterized product variant
   * @param {String} currentProductId - set current productId
   * @param {String} currentVariantId - set current variantId
   * @return {undefined} return nothing, sets in session
   */
  setProduct: function (currentProductId, currentVariantId) {
    let productId = currentProductId;
    let variantId = currentVariantId;
    if (!productId.match(/^[A-Za-z0-9]{17}$/)) {
      let product = ReactionCore.Collections.Products.findOne({
        handle: productId.toLowerCase()
      });
      if (product) {
        productId = product._id;
      }
    }
    setCurrentProduct(productId);
    setCurrentVariant(variantId);
  },
  // TODO: after 1.3 move this to other place out of global scope
  getVariants(id, type) {
    return ReactionCore.Collections.Products.find({
      ancestors: { $in: [id] },
      type: type || "variant"
    }).fetch();
  },
  // TODO: move all this methods this to export function after 1.3
  getProductPriceRange(productId) {
    const product = ReactionCore.Collections.Products.findOne(productId);
    if (!product) {
      return;
    }
    const variants = ReactionCore.getTopVariants(product._id);

    if (variants.length > 0) {
      let variantPrices = [];
      variants.map(variant => {
        let range = ReactionCore.getVariantPriceRange(variant._id);
        if (typeof range === "string") {
          let firstPrice = parseFloat(range.substr(0, range.indexOf(" ")));
          let lastPrice = parseFloat(range.substr(range.lastIndexOf(" ") + 1));
          variantPrices.push(firstPrice, lastPrice);
        } else {
          variantPrices.push(range);
        }
      });

      //if (Meteor.isServer) {
      //  return { min: _.min(variantPrices), max: _.max(variantPrices) };
      //}

      let priceMin = _.min(variantPrices);
      let priceMax = _.max(variantPrices);

      if (priceMin === priceMax) {
        return priceMin.toString();
      }
      return `${priceMin} - ${priceMax}`;
    }
  },
  getVariantPriceRange(variantId) {
    const children = ReactionCore.getVariants(variantId);

    switch (children.length) {
      case 0:
        return ReactionCore.Collections.Products.findOne(variantId).price;
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
  getVariants(id, type) {
    return ReactionCore.Collections.Products.find({
      ancestors: { $in: [id] },
      type: type || "variant"
    }).fetch();
  },
  getTopVariants(id) {
    return ReactionCore.Collections.Products.find({
      ancestors: [id],
      type: "variant"
    }).fetch();
  }
});
