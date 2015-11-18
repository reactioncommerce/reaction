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
    } else if ((Meteor.isServer && this.operator !== "$pull") ||
      Meteor.isClient && this.isInsert) {
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
  },
  /**
   * @summary Recursive method which trying to find a new handle, given the
   * existing copies
   * @param {String} handle - product handle
   * @param {String} productId - current product _id
   * @return {String} handle - modified handle
   */
  createHandle: function (handle, productId) {
    // exception product._id needed for cases then double triggering happens
    let handleCount = Products.find({
      handle: handle,
      _id: { $nin: [productId]
      }}).count();
    // current product "copy" number
    let handleNumberSuffix = 0;
    // product handle prefix
    let handleString = handle;
    // copySuffix "-copy-number" suffix of product
    let copySuffix = handleString.match(/-copy-\d+$/)
      || handleString.match(/-copy$/);

    // if product is a duplicate, we should take the copy number, and cut
    // the handle
    if (copySuffix) {
      // we can have two cases here: copy-number and just -copy. If there is
      // no numbers in copySuffix then we should put 1 in handleNumberSuffix
      handleNumberSuffix = +String(copySuffix).match(/\d+$/) || 1;
      // removing last numbers and last "-" if it presents
      handleString = handle.replace(/\d+$/, '').replace(/-$/, '');
    }

    // if we have more than one product with the same handle, we should mark
    // it as "copy" or increment our product handle if it contain numbers.
    if (handleCount > 0) {
      // if we have product with name like "product4", we should take care
      // about its uniqueness
      if (handleNumberSuffix > 0) {
        handle = `${handleString}-${handleNumberSuffix + handleCount}`;
      } else {
        // first copy will be "...-copy", second: "...-copy-2"
        handle = `${handleString}-copy${ handleCount > 1
          ? '-' + handleCount : ''}`;
      }
    }

    // we should check again if there are any new matches with DB
    if (Products.find({ handle: handle }).count() !== 0) {
      handle = ReactionCore.createHandle(handle, productId);
    }

    return handle;
  },
  /**
   * @method copyMedia
   * @description copy images links to cloned variant from original
   * @param {String} newId - [cloned|original] product _id
   * @param {String} variantOldId - old variant _id
   * @param {String} variantNewId - - cloned variant _id
   * @fires ReactionCore.Collections.Media#update
   */
  copyMedia: (newId, variantOldId, variantNewId) => {
    ReactionCore.Collections.Media.find({
      "metadata.variantId": variantOldId
    }).forEach(function (fileObj) {
      let newFile = fileObj.copy();
      return newFile.update({
        $set: {
          "metadata.productId": newId,
          "metadata.variantId": variantNewId
        }
      });
    });
  }
});
