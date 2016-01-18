/**
 * Reaction Product Methods
 */
/* eslint new-cap: 0 */
/* eslint no-loop-func: 0 */
/* eslint quotes: 0 */
/**
 * @function createTitle
 * @description Recursive method which trying to find a new `title`, given the
 * existing copies
 * @param {String} newTitle - product `title`
 * @param {String} productId - current product `_id`
 * @return {String} title - modified `title`
 */
function createTitle(newTitle, productId) {
  // exception product._id needed for cases then double triggering happens
  let title = newTitle || "";
  let titleCount = ReactionCore.Collections.Products.find({
    title: title,
    _id: {
      $nin: [productId]
    }
  }).count();
  // current product "copy" number
  let titleNumberSuffix = 0;
  // product handle prefix
  let titleString = title;
  // copySuffix "-copy-number" suffix of product
  let copySuffix = titleString.match(/-copy-\d+$/) || titleString.match(/-copy$/);
  // if product is a duplicate, we should take the copy number, and cut
  // the handle
  if (copySuffix) {
    // we can have two cases here: copy-number and just -copy. If there is
    // no numbers in copySuffix then we should put 1 in handleNumberSuffix
    titleNumberSuffix = +String(copySuffix).match(/\d+$/) || 1;
    // removing last numbers and last "-" if it presents
    titleString = title.replace(/\d+$/, '').replace(/-$/, '');
  }

  // if we have more than one product with the same handle, we should mark
  // it as "copy" or increment our product handle if it contain numbers.
  if (titleCount > 0) {
    // if we have product with name like "product4", we should take care
    // about its uniqueness
    if (titleNumberSuffix > 0) {
      title = `${titleString}-${titleNumberSuffix + titleCount}`;
    } else {
      // first copy will be "...-copy", second: "...-copy-2"
      title = `${titleString}-copy${ titleCount > 1 ? "-" + titleCount : ""}`;
    }
  }

  // we should check again if there are any new matches with DB
  if (ReactionCore.Collections.Products.find({
    title: title
  }).count() !== 0) {
    title = createTitle(title, productId);
  }
  return title;
}

/**
 * @function createHandle
 * @description Recursive method which trying to find a new `handle`, given the
 * existing copies
 * @param {String} productHandle - product `handle`
 * @param {String} productId - current product `_id`
 * @return {String} handle - modified `handle`
 */
function createHandle(productHandle, productId) {
  let handle = productHandle || "";
  // exception product._id needed for cases then double triggering happens
  let handleCount = ReactionCore.Collections.Products.find({
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
  if (ReactionCore.Collections.Products.find({ handle: handle }).count() !== 0) {
    handle = createHandle(handle, productId);
  }

  return handle;
}

/**
 * @function copyMedia
 * @description copy images links to cloned variant from original
 * @param {String} newId - [cloned|original] product _id
 * @param {String} variantOldId - old variant _id
 * @param {String} variantNewId - - cloned variant _id
 * @fires ReactionCore.Collections.Media#update
 * @return {undefined}
 */
function copyMedia(newId, variantOldId, variantNewId) {
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

Meteor.methods({
  /**
   * products/cloneVariant
   * @summary clones a product variant into a new variant
   * @description the products/cloneVariant method copies variants, but will also create
   * and clone child variants (options)
   * productId,variantId to clone
   * add parentId to create children
   * Note: parentId and variantId can be the same if creating a child variant.
   * @param {String} productId - the productId we're whose variant we're cloning
   * @param {String} variantId - the variantId that we're cloning
   * @todo in debug mode method runs twice sometimes
   * @todo we don't need productId. Currently it used for mediaCopy only
   * @todo rewrite @description
   * @return {undefined}
   */
  "products/cloneVariant": function (productId, variantId) {
    check(productId, String);
    check(variantId, String);
    // user needs createProduct permission to clone
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();

    const variants = ReactionCore.Collections.Products.find({
      $or: [{ _id: variantId }, { ancestors: { $in: [variantId] }}],
      type: "variant"
    }).fetch();
    // exit if we're trying to clone a ghost
    if (variants.length === 0) {
      return;
    }
    const variantNewId = Random.id(); // for the parent variant

    variants.map(variant => {
      const oldId = variant._id;
      let type = "child";
      let clone = {};
      if (variantId === variant._id) {
        type = "parent";
        Object.assign(clone, variant, {
          _id: variantNewId,
          title: ""
        });
      } else {
        const parentIndex = variant.ancestors.indexOf(variantId);
        const ancestorsClone = variant.ancestors.slice(0);
        // if variantId exists in ancestors, we override it by new _id
        !!~parentIndex && ancestorsClone.splice(parentIndex, 1, variantNewId);
        Object.assign(clone, variant, {
          _id: Random.id(),
          ancestors: ancestorsClone,
          optionTitle: "",
          title: ""
        });
      }
      delete clone.updatedAt;
      delete clone.createdAt;
      delete clone.inventoryQuantity;
      // TODO try to throw out the productId from `copyMedia`
      copyMedia(productId, oldId, clone._id);

      ReactionCore.Collections.Products.insert(clone, { validate: false },
        (error, result) => {
          if (result) {
            if (type === "child") {
              ReactionCore.Log.info(
                `products/cloneVariant: created sub child clone: ${
                  clone._id} from ${variantId}`
              );
            } else {
              ReactionCore.Log.info(
                `products/cloneVariant: created clone: ${
                  clone._id} from ${variantId}`
              );
            }
          }
        }
      );
    });

  },

  /**
   * products/createVariant
   * @summary initializes empty variant template
   * @param {String} parentId - the product _id or top level variant _id where
   * we create variant
   * @param {Object} [newVariant] - variant object
   * @return {String} new variantId
   */
  "products/createVariant": function (parentId, newVariant) {
    check(parentId, String);
    check(newVariant, Match.OneOf(Object, void 0));
    // must have createProduct permissions
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();

    const newVariantId = Random.id();
    const parent = ReactionCore.Collections.Products.findOne(parentId);
    const { ancestors } = parent;
    Array.isArray(ancestors) && ancestors.push(parentId);
    const assembledVariant = Object.assign(newVariant || {}, {
      _id: newVariantId,
      ancestors: ancestors
    });

    if (!newVariant) {
      Object.assign(assembledVariant, {
        title: "",
        price: 0.00,
        type: "variant"
      });
    }
    check(assembledVariant, ReactionCore.Schemas.ProductVariant);

    ReactionCore.Collections.Products.insert(assembledVariant,
      (error, result) => {
        if (result) {
          ReactionCore.Log.info(
            `products/createVariant: created variant: ${
              newVariantId} for ${parentId}`
          );
        }
      }
    );

    return newVariantId;
  },

  /**
   * products/updateVariant
   * @summary update individual variant with new values, merges into original
   * only need to supply updated information
   * @param {Object} variant - current variant object
   * @todo some use cases of this method was moved to "products/
   * updateProductField", but it still used
   * @return {String} returns update result
   */
  "products/updateVariant": function (variant) {
    check(variant, Object);
    // must have createProduct permissions
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();

    const { Products } = ReactionCore.Collections;
    let currentVariant = Products.findOne(variant._id);
    // update variants
    if (typeof currentVariant === "object") {
      const newVariant = Object.assign({}, currentVariant, variant);

      return Products.update({
        "_id": variant._id
      }, {
        $set: newVariant // newVariant already contain `type` property, so we
        // do not need to pass it explicitly
      }, {
        validate: false
      });
    }
  },

  /**
   * products/updateVariants
   * @summary update whole variants array
   * @param {Array} variants - array of variants to update
   * @return {String} returns update result
   * @todo remove this method
   */
  "products/updateVariants": function (variants) {
    check(variants, [Object]);
    // must have createProduct permissions
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    let product = ReactionCore.Collections.Products.findOne({
      "variants._id": variants[0]._id
    });
    return ReactionCore.Collections.Products.update(product._id, {
      $set: {
        variants: variants
      }
    }, {
      validate: false
    });
  },

  /**
   * products/deleteVariant
   * @summary delete variant, which should also delete child variants
   * @param {String} variantId - variantId to delete
   * @returns {Boolean} returns update results: `true` - if at least one variant
   * was removed or `false` if nothing was removed
   */
  "products/deleteVariant": function (variantId) {
    check(variantId, String);
    // must have createProduct permissions
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    const selector = {
      $or: [{
        "_id": variantId
      }, {
        ancestors: {
          $in: [variantId]
        }
      }]
    };
    const toDelete = ReactionCore.Collections.Products.find(selector).fetch();
    // out if nothing to delete
    if (!Array.isArray(toDelete) || toDelete.length === 0) return false;
    const deleted = ReactionCore.Collections.Products.remove(selector);

    // todo clean this:

    //ReactionCore.Collections.Products.update({
    //  "variants.parentId": variantId
    //}, {
    //  $pull: {
    //    variants: {
    //      parentId: variantId
    //    }
    //  }
    //});
    //ReactionCore.Collections.Products.update({
    //  "variants._id": variantId
    //}, {
    //  $pull: {
    //    variants: {
    //      _id: variantId
    //    }
    //  }
    //});

    // TODO we don't need to keep images from removed variants. We need to
    // remove it too. Or we have another plans for this junk?
    toDelete.map(variant => {
      return ReactionCore.Collections.Media.remove({
        "metadata.variantId": variant._id
      });
      /*return ReactionCore.Collections.Media.update({
        "metadata.variantId": variant._id
      }, {
        $unset: {
          "metadata.productId": "",
          "metadata.variantId": "",
          "metadata.priority": ""
        }
      }, {
        multi: true
      });*/
    });
    //_.each(deleted, function (product) {
    //  return _.each(product.variants, function (variant) {
    //    if (variant.parentId === variantId || variant._id ===
    //      variantId) {
    //      return ReactionCore.Collections.Media.update({
    //        "metadata.variantId": variant._id
    //      }, {
    //        $unset: {
    //          "metadata.productId": "",
    //          "metadata.variantId": "",
    //          "metadata.priority": ""
    //        }
    //      }, {
    //        multi: true
    //      });
    //    }
    //  });
    //});
    return typeof deleted === "number" && deleted > 0;
  },

  /**
   * products/cloneProduct
   * @summary clone a whole product, defaulting visibility, etc
   * in the future we are going to do an inheritance product
   * that maintains relationships with the cloned product tree
   * @param {Array} productOrArray - products array to clone
   * @returns {Array} returns insert results
   */
  "products/cloneProduct": function (productOrArray) {
    check(productOrArray, Match.OneOf(Array, Object));
    // must have createProduct permissions
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();

    const results = [];
    let result;
    const pool = []; // pool of id pairs: { oldId, newId }
    const getIds = id => {
      return pool.filter(function (pair) {
        return pair.oldId === this.id
      }, { id: id });
    };
    const setId = ids => pool.push(ids);
    const buildAncestors = ancestors => {
      const newAncestors = [];
      ancestors.map(oldId => {
        let pair = getIds(oldId);
        // TODO do we always have newId on this step?
        newAncestors.push(pair[0].newId);
      });

      return newAncestors;
    };
    let products;

    if (_.isArray(productOrArray) === false) {
      products = [productOrArray];
    } else {
      products = productOrArray;
    }

    for (let product of products) {
      // cloning product
      let productNewId = Random.id();
      setId({ oldId: product._id, newId: productNewId });

      let newProduct = Object.assign({}, product, {
        _id: productNewId
        // ancestors: product.ancestors.push(product._id)
      });
      delete newProduct.updatedAt;
      delete newProduct.createdAt;
      delete newProduct.publishedAt;
      // todo should we delete position?
      delete newProduct.handle;
      newProduct.isVisible = false;
      if (newProduct.title) {
        newProduct.handle = createHandle(
          getSlug(newProduct.title),
          newProduct._id
        );
        // todo test this
        newProduct.title = createTitle(
          newProduct.title,
          newProduct._id
        );
      }
      result = ReactionCore.Collections.Products.insert(newProduct,
        { validate: false });
      results.push(result);

      // cloning variants
      const variants = ReactionCore.Collections.Products.find({
        ancestors: { $in: [product._id] }
      }).fetch();
      // TODO maybe we need to sort variants here, in order to keep ancestors tree
      for (let variant of variants) {
        let variantNewId = Random.id();
        setId({ oldId: variant._id, newId: variantNewId });
        let ancestors = buildAncestors(variant.ancestors);
        let newVariant = Object.assign({}, variant, {
          _id: variantNewId,
          ancestors: ancestors
        });
        delete newVariant.updatedAt;
        delete newVariant.createdAt;
        delete newVariant.publishedAt; // TODO can variant have this param?

        result = ReactionCore.Collections.Products.insert(
          newVariant, { validate: false }
        );
        copyMedia(productNewId, variant._id, variantNewId);
        results.push(result);
      }
    }
  },

  /**
   * products/createProduct
   * @summary when we create a new product, we create it with
   * an empty variant. all products have a variant
   * with pricing and details
   * @param {Object} product - optional product object
   * @return {String} return insert result
   */
  "products/createProduct": function (product) {
    check(product, Match.Optional(Object));
    // must have createProduct permission
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    // if a product object was provided
    if (product) {
      return ReactionCore.Collections.Products.insert(product);
    }

    return ReactionCore.Collections.Products.insert({
      //_id: _id,
      type: "simple" // needed for multi-schema
    }, {
      validate: false
    }, (error, result) => {
      // additionally, we want to create a variant to a new product
      if (result) {
        ReactionCore.Collections.Products.insert({
          ancestors: [result],
          price: 0.00,
          title: "",
          type: "variant" // needed for multi-schema
        });
      }
    });
  },

  /**
   * products/deleteProduct
   * @summary delete a product and unlink it from all media
   * @param {String} productId - productId to delete
   * @returns {Boolean} returns delete result
   */
  "products/deleteProduct": function (productId) {
    check(productId, Match.OneOf(Array, String));
    // must have admin permission to delete
    if (!ReactionCore.hasAdminAccess()) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();

    let productIds;

    if (_.isString(productId)) {
      productIds = [productId];
    } else {
      productIds = productId;
    }
    const productsWithVariants = ReactionCore.Collections.Products.find({
      $or: [{ _id: { $in: productIds }}, { ancestors: { $in: productIds }}]
    }, { fields: { type: 1 }}).fetch();

    const ids = [];
    productsWithVariants.map(doc => {
      ids.push(doc._id);
    });

    const numRemoved = ReactionCore.Collections.Products.remove({
      _id: {
        $in: ids
      }
    });

    if (numRemoved > 0) {
      ReactionCore.Collections.Media.update({
        "metadata.productId": {
          $in: ids
        }
      }, {
        $unset: {
          "metadata.productId": "",
          "metadata.variantId": "",
          "metadata.priority": ""
        }
      }, {
        multi: true
      });
      return true;
    }
    // return false if unable to delete
    return false;
  },

  /**
   * products/updateProductField
   * @summary update single product or variant field
   * @param {String} _id - product._id or variant._id to update
   * @param {String} field - key to update
   * @param {*} value - update property value
   * @todo rename it to something like "products/updateField" to  reflect
   * @todo we need to know which type of entity field belongs. For that we could
   * do something like: const type = Products.findOne(_id).type or transmit type
   * as param if it possible
   * latest changes. its used for products and variants
   * @return {String} returns update result
   */
  "products/updateProductField": function (_id, field, value) {
    check(_id, String);
    check(field, String);
    check(value, Match.OneOf(String, Object, Array, Boolean));
    // must have createProduct permission
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();

    const type = ReactionCore.Collections.Products.findOne(_id).type;
    let stringValue = EJSON.stringify(value);
    let update = EJSON.parse("{\"" + field + "\":" + stringValue + "}");

    return ReactionCore.Collections.Products.update(_id, {
      $set: update
    }, { selector: { type: type } });
  },

  /**
   * products/updateProductTags
   * @summary method to insert or update tag with hierachy
   * @param {String} productId - productId
   * @param {String} tagName - tagName
   * @param {String} tagId - tagId
   * @return {String} return result
   */
  "products/updateProductTags": function (productId, tagName, tagId) {
    check(productId, String);
    check(tagName, String);
    check(tagId, Match.OneOf(String, null));
    // must have createProduct permission
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();

    let newTag = {
      slug: getSlug(tagName),
      name: tagName
    };

    let existingTag = ReactionCore.Collections.Tags.findOne({
      name: tagName
    });

    if (existingTag) {
      let productCount = ReactionCore.Collections.Products.find({
        _id: productId,
        hashtags: {
          $in: [existingTag._id]
        }
      }).count();
      if (productCount > 0) {
        throw new Meteor.Error(403, "Existing Tag, Update Denied");
      }
      ReactionCore.Collections.Products.update(productId, {
        $push: {
          hashtags: existingTag._id
        }
      }, { selector: { type: "simple" } });
    } else if (tagId) {
      ReactionCore.Collections.Tags.update(tagId, {
        $set: newTag
      });
    } else {
      newTag.isTopLevel = false;
      newTag.shopId = ReactionCore.getShopId();
      newTag.updatedAt = new Date();
      newTag.createdAt = new Date();
      newTag._id = ReactionCore.Collections.Tags.insert(newTag);
      ReactionCore.Collections.Products.update(productId, {
        $push: {
          hashtags: newTag._id
        }
      }, { selector: { type: "simple" } });
    }
  },

  /**
   * products/removeProductTag
   * @summary method to remove tag from product
   * @param {String} productId - productId
   * @param {String} tagId - tagId
   * @return {String} return update result
   */
  "products/removeProductTag": function (productId, tagId) {
    check(productId, String);
    check(tagId, String);

    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();

    ReactionCore.Collections.Products.update(productId, {
      $pull: {
        hashtags: tagId
      }
    }, { selector: { type: "simple" } });

    let productCount = ReactionCore.Collections.Products.find({
      hashtags: {
        $in: [tagId]
      }
    }).count();

    let relatedTagsCount = ReactionCore.Collections.Tags.find({
      relatedTagIds: {
        $in: [tagId]
      }
    }).count();

    if (productCount === 0 && relatedTagsCount === 0) {
      return ReactionCore.Collections.Tags.remove(tagId);
    }
  },

  /**
   * products/setHandle
   * @summary copy of "products/setHandleTag", but without tag
   * @param {String} productId - productId
   * @returns {String} handle - product handle
   */
  "products/setHandle": function (productId) {
    check(productId, String);

    // must have createProduct permission
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();

    let product = ReactionCore.Collections.Products.findOne(productId);
    let handle = getSlug(product.title);
    handle = createHandle(handle, product._id);
    ReactionCore.Collections.Products.update(product._id, {
      $set: {
        handle: handle,
        type: "simple"
      }
    });

    return handle;
  },

  /**
   * products/setHandleTag
   * @summary set or toggle product handle
   * @param {String} productId - productId
   * @param {String} tagId - tagId
   * @return {String} return update result
   */
  "products/setHandleTag": function (productId, tagId) {
    check(productId, String);
    check(tagId, String);

    // must have createProduct permission
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    function getSet(handle) {
      return {
        $set: {
          handle: handle,
          type: "simple"
        }
      };
    }
    this.unblock();

    let product = ReactionCore.Collections.Products.findOne(productId);
    let tag = ReactionCore.Collections.Tags.findOne(tagId);
    // set handle
    if (product.handle === tag.slug) {
      let handle = getSlug(product.title);
      handle = createHandle(handle, product._id);
      ReactionCore.Collections.Products.update(product._id, getSet(handle));

      return handle;
    }
    // toggle handle
    let existingHandles = ReactionCore.Collections.Products.find({
      handle: tag.slug
    }).fetch();
    // this is needed to take care about product's handle which(product) was
    // previously tagged.
    for (let currentProduct of existingHandles) {
      let currentProductHandle = createHandle(
        getSlug(currentProduct.title),
        currentProduct._id);
      ReactionCore.Collections.Products.update(currentProduct._id,
        getSet(currentProductHandle));
    }
    ReactionCore.Collections.Products.update(product._id, getSet(tag.slug));

    return tag.slug;
  },

  /**
   * products/updateProductPosition
   * @summary update product grid positions
   * @param {String} productId - productId
   * @param {Object} positionData -  an object with tag,position,dimensions
   * @return {String} returns
   */
  "products/updateProductPosition": function (productId, positionData) {
    check(productId, String);
    check(positionData, Object);

    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    this.unblock();

    let updateResult;
    let product = ReactionCore.Collections.Products.findOne({
      "_id": productId,
      "positions.tag": positionData.tag
    });

    function addPosition() {
      updateResult = ReactionCore.Collections.Products.update({
        _id: productId
      }, {
        $addToSet: {
          positions: positionData
        },
        $set: {
          updatedAt: new Date(),
          "type": "simple" // for multi-schema
        }
      }, function (error) {
        if (error) {
          ReactionCore.Log.warn(error);
          throw new Meteor.Error(403, error);
        }
      });
    }

    function updatePosition() {
      updateResult = ReactionCore.Collections.Products.update({
        "_id": productId,
        "positions.tag": positionData.tag
      }, {
        $set: {
          "positions.$.position": positionData.position,
          "positions.$.pinned": positionData.pinned,
          "positions.$.weight": positionData.weight,
          "positions.$.updatedAt": new Date(),
          "type": "simple" // for multi-schema
        }
      }, function (error) {
        if (error) {
          ReactionCore.Log.warn(error);
          throw new Meteor.Error(403, error);
        }
      });
    }

    if (!product) {
      addPosition();
    } else {
      if (product.positions) {
        updatePosition();
      } else {
        addPosition();
      }
    }

    return updateResult;
  },
  /**
   * products/updateMetaFields
   * @summary update product grid positions
   * @param {String} productId - productId
   * @param {Object} updatedMeta - update object with metadata
   * @param {Object} meta - current meta object
   * @return {String} returns update result
   */
  "products/updateMetaFields": function (productId, updatedMeta, meta) {
    check(productId, String);
    check(updatedMeta, Object);
    check(meta, Match.OptionalOrNull(Object));
    // must have createProduct permission
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    // update existing metadata
    if (meta) {
      return ReactionCore.Collections.Products.update({
        _id: productId,
        metafields: meta
      }, {
        $set: {
          "metafields.$": updatedMeta
        }
      });
    }
    // adds metadata
    return ReactionCore.Collections.Products.update({
      _id: productId
    }, {
      $addToSet: {
        metafields: updatedMeta
      }
    });
  },

  /**
   * products/publishProduct
   * @summary publish (visibility) of product
   * @todo hook into publishing flow
   * @param {String} productId - productId
   * @return {Boolean} product.isVisible
   */
  "products/publishProduct": function (productId) {
    check(productId, String);
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();

    const product = ReactionCore.Collections.Products.findOne(productId);
    const variants = ReactionCore.Collections.Products.find({
      ancestors: { $in: [productId] }
    }).fetch();
    let variantValidator = true;

    if (typeof product === "object" && product.title.length > 1) {
      if (variants.length > 0) {
        variants.map(variant => {
          if (!(typeof variant.price === "number" && variant.price > 0 &&
            variant.title.length > 1)) {
            variantValidator = false;
          }
          if (typeof optionTitle === "string" && !(optionTitle.length > 0)) {
            variantValidator = false;
          }
        });
      }

      if (!variantValidator) {
        ReactionCore.Log.debug("invalid product visibility ", productId);
        throw new Meteor.Error(400, "Bad Request");
      }

      // update product visibility
      ReactionCore.Log.info("toggle product visibility ", product._id, !
        product.isVisible);

      return Boolean(ReactionCore.Collections.Products.update(product._id, {
        $set: {
          isVisible: !product.isVisible,
          type: "simple" // required by multi-schema
        }
      }));
      // return Boolean(result);
    } else {
      ReactionCore.Log.debug("invalid product visibility ", productId);
      throw new Meteor.Error(400, "Bad Request");
    }
  }
});
