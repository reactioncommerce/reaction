/**
 * Match.OptionalOrNull
 * See Meteor Match methods
 * @param {String} pattern - match pattern
 * @return {Boolen} matches - void, null, or pattern
 */
Match.OptionalOrNull = function (pattern) {
  return Match.OneOf(void 0, null, pattern);
};
/*
 * extend ReactionCore and add common methods
 */
_.extend(ReactionCore, {
  /**
   * ReactionCore.shopIdAutoValue
   * @summary used for schemea injection autoValue
   * @return {String} returns current shopId
   */
  shopIdAutoValue: function () {
    // we should always have a shopId
    if (ReactionCore.getShopId()) {
      if (this.isSet && this.isFromTrustedCode) {
        return ReactionCore.getShopId();
      }
      if (Meteor.isClient && this.isInsert) {
        return ReactionCore.getShopId();
      } else if (Meteor.isServer && (this.isInsert || this.isUpsert)) {
        return ReactionCore.getShopId();
      }
      return this.unset();
    }
  },

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
    let product;
    if (!productId.match(/^[A-Za-z0-9]{17}$/)) {
      product = ReactionCore.Collections.Products.findOne({
        handle: productId.toLowerCase()
      });
      productId = product !== null ? product._id : void 0;
    }
    setCurrentProduct(productId);
    setCurrentVariant(variantId);
  }
});
