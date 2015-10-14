getSlug = function (slugString) {
  return Transliteration.slugify(slugString);
};

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
   * @example autoValue: ReactionCore.shopIdAutoValue
   * @return {String} returns current shopId
   */
  shopIdAutoValue: function () {
    // we should always have a shopId
    if (ReactionCore.getShopId()) {
      if (this.isSet && Meteor.isServer) {
        return this.value;
      } else if (Meteor.isServer || Meteor.isClient && this.isInsert) {
        return ReactionCore.getShopId();
      }
      return this.unset();
    }
  },
  /**
   * ReactionCore.schemaIdAutoValue
   * @summary used for schemea injection autoValue
   * @example autoValue: ReactionCore.schemaIdAutoValue
   * @return {String} returns randomId
   */
  schemaIdAutoValue: function () {
    if (this.isSet && Meteor.isServer) {
      return this.value;
    } else if (Meteor.isServer || Meteor.isClient && this.isInsert) {
      return Random.id();
    }
    return this.unset();
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
