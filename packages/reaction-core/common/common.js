
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
  }
});
