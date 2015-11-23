/**
 * Reaction Product Methods
 */
/* eslint new-cap: 0 */
/* eslint no-loop-func: 0 */

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
   * @param {String} parentId - optional variantId of a parent variant to create a childVariant
   * @return {String} returns new clone variantId
   */
  "products/cloneVariant": function (productId, variantId, parentId) {
    check(productId, String);
    check(variantId, String);
    check(parentId, Match.Optional(String));
    let children;
    let clone;
    let product;
    // user needs createProduct permission to clone
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();

    product = Products.findOne(productId);
    // create variant hierachy structure
    variant = (function () {
      const results = [];
      for (let variant of product.variants) {
        if (variant._id === variantId) {
          results.push(variant);
        }
      }
      return results;
    })();
    // exit if we're trying to clone a ghost
    if (!(variant.length > 0)) {
      return false;
    }
    // variant is an array, with only
    // selected variant
    clone = variant[0];
    // we use id with variant children
    clone._id = Random.id();
    // if this is going to be a child
    if (parentId) {
      ReactionCore.Log.info(
        "products/cloneVariant: create parent child clone from ",
        parentId);
      clone.parentId = variantId;
      delete clone.inventoryQuantity;
      Products.update({
        _id: productId
      }, {
        $push: {
          variants: clone
        }
      }, {
        validate: false
      });
      return clone._id;
    }
    // delete original values for new clone
    clone.cloneId = productId;
    delete clone.updatedAt;
    delete clone.createdAt;
    delete clone.inventoryQuantity;
    delete clone.title;
    // push the new variant to the product
    Products.update({
      _id: productId
    }, {
      $push: {
        variants: clone
      }
    }, {
      validate: false
    });
    // process children
    children = (function () {
      let results = [];
      for (let variant of product.variants) {
        if (variant.parentId === variantId) {
          results.push(variant);
        }
      }
      return results;
    })();
    // if we have children
    if (children.length > 0) {
      ReactionCore.Log.info(
        "products/cloneVariant: create sub child clone from ", parentId
      );
      for (let childClone of children) {
        childClone._id = Random.id();
        childClone.parentId = clone._id;
        Products.update({
          _id: productId
        }, {
          $push: {
            variants: childClone
          }
        }, {
          validate: false
        });
      }
    }
    return clone._id;
  },

  /**
   * products/createVariant
   * @summary initializes empty variant template (all others are clones)
   * should only be seen when all variants have been deleted from a product.
   * @param {String} productId - the productId where we create variant
   * @param {String} newVariant - variant object
   * @return {String} new variantId
   */
  "products/createVariant": function (productId, newVariant) {
    check(productId, String);
    check(newVariant, Match.OneOf(Object, void 0));
    let createVariant = newVariant || {};
    // must have createProduct permissions
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    // random id for new variant
    let newVariantId = Random.id();
    // if we have a newVariant object we'll use it.
    if (newVariant) {
      createVariant._id = newVariantId;
      check(createVariant, ReactionCore.Schemas.ProductVariant);
    } else {
      createVariant = {
        _id: newVariantId,
        title: "",
        price: 0.00,
        type: "variant"
      };
    }

    Products.update({
      _id: productId
    }, {
      $addToSet: {
        variants: createVariant
      }
    }, {
      validate: false
    });
    return newVariantId;
  },

  /**
   * products/updateVariant
   * @summary update individual variant with new values, merges into original
   * only need to supply updated information
   * @param {Object} variant - current variant object
   * @param {Object} updateDoc - update object
   * @param {Object} currentDoc - update variant id
   * @return {String} returns update result
   */
  "products/updateVariant": function (variant, updateDoc, currentDoc) {
    check(variant, Object);
    check(updateDoc, Match.OptionalOrNull(Object));
    check(currentDoc, Match.OptionalOrNull(String));
    // must have createProduct permissions
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();

    let newVariant;
    let Products = ReactionCore.Collections.Products;
    let product = Products.findOne({
      "variants._id": variant._id
    });
    // update variants
    if (product !== null ? product.variants : void 0) {
      for (let variants of product.variants) {
        if (variants._id === variant._id) {
          newVariant = _.extend(variants, variant);
        }
      }
      return Products.update({
        "_id": product._id,
        "variants._id": variant._id
      }, {
        $set: {
          "variants.$": newVariant
        }
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
   */
  "products/updateVariants": function (variants) {
    check(variants, [Object]);
    // must have createProduct permissions
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    let product = Products.findOne({
      "variants._id": variants[0]._id
    });
    return Products.update(product._id, {
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
   * @returns {String} returns update results
   */
  "products/deleteVariant": function (variantId) {
    check(variantId, String);
    // must have createProduct permissions
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    let deleted = Products.find({
      $or: [{
        "variants.parentId": variantId
      }, {
        "variants._id": variantId
      }]
    }).fetch();
    Products.update({
      "variants.parentId": variantId
    }, {
      $pull: {
        variants: {
          parentId: variantId
        }
      }
    });
    Products.update({
      "variants._id": variantId
    }, {
      $pull: {
        variants: {
          _id: variantId
        }
      }
    });
    _.each(deleted, function (product) {
      return _.each(product.variants, function (variant) {
        if (variant.parentId === variantId || variant._id ===
          variantId) {
          return ReactionCore.Collections.Media.update({
            "metadata.variantId": variant._id
          }, {
            $unset: {
              "metadata.productId": "",
              "metadata.variantId": "",
              "metadata.priority": ""
            }
          }, {
            multi: true
          });
        }
      });
    });
    return true;
  },

  /**
   * products/cloneProduct
   * @summary clone a whole product, defaulting visibility, etc
   * in the future we are going to do an inheritance product
   * that maintains relationships with the cloned product tree
   * @param {Object} product - product object to clone
   * @returns {String} returns insert result
   */
  "products/cloneProduct": function (productOrArray) {
    check(productOrArray, Match.OneOf(Array, Object));
    // must have createProduct permissions
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();

    let products;
    let results = [];

    if (_.isArray(productOrArray) === false) {
      products = [productOrArray];
    } else {
      products = productOrArray;
    }

    for (let product of products) {
      let i = 0;

      let handleCount = Products.find({
        cloneId: product._id
      }).count() + 1;

      product.cloneId = product._id;
      product._id = Random.id();
      delete product.updatedAt;
      delete product.createdAt;
      delete product.publishedAt;
      delete product.handle;
      product.isVisible = false;
      if (product.title) {
        product.handle = ReactionCore.createHandle(
          getSlug(product.title),
          product._id
        );
      }
      while (i < product.variants.length) {
        let newVariantId = Random.id();
        let oldVariantId = product.variants[i]._id;
        product.variants[i]._id = newVariantId;
        ReactionCore.Collections.Media.find({
          "metadata.variantId": oldVariantId
        }).forEach(function (fileObj) {
          let newFile = fileObj.copy();
          return newFile.update({
            $set: {
              "metadata.productId": product._id,
              "metadata.variantId": newVariantId
            }
          });
        });
        if (!product.variants[i].parentId) {
          while (i < product.variants.length) {
            if (product.variants[i].parentId === oldVariantId) {
              product.variants[i].parentId = newVariantId;
            }
            i++;
          }
        }
        i++;
      }
      let result = Products.insert(product, {
        validate: false
      });
      results.push(result);
    }
    return results;
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
      return Products.insert(product);
    }
    // default product
    return Products.insert({
      _id: Random.id(),
      title: "",
      variants: [{
        _id: Random.id(),
        title: "",
        price: 0.00
      }]
    }, {
      validate: false
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

    let numRemoved = Products.remove({
      _id: {
        $in: productIds
      }
    });

    if (numRemoved > 0) {
      ReactionCore.Collections.Media.update({
        "metadata.productId": {
          $in: productIds
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
   * @summary update single product field
   * @param {String} productId - productId to update
   * @param {String} field - key to update
   * @param {String} value - update property value
   * @return {String} returns update result
   */
  "products/updateProductField": function (productId, field, value) {
    check(productId, String);
    check(field, String);
    check(value, Match.OneOf(String, Object, Array, Boolean));
    // must have createProduct permission
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();

    let stringValue = EJSON.stringify(value);
    let update = EJSON.parse("{\"" + field + "\":" + stringValue + "}");

    return Products.update(productId, {
      $set: update
    });
  },

  /**
   * products/updateProductTags
   * @summary method to insert or update tag with hierachy
   * @param {String} productId - productId
   * @param {String} tagName - tagName
   * @param {String} tagId - tagId
   * @param {String} currentTagId - currentTagId
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

    let existingTag = Tags.findOne({
      name: tagName
    });

    if (existingTag) {
      let productCount = Products.find({
        _id: productId,
        hashtags: {
          $in: [existingTag._id]
        }
      }).count();
      if (productCount > 0) {
        throw new Meteor.Error(403, "Existing Tag, Update Denied");
      }
      Products.update(productId, {
        $push: {
          hashtags: existingTag._id
        }
      });
    } else if (tagId) {
      Tags.update(tagId, {
        $set: newTag
      });
    } else {
      newTag.isTopLevel = false;
      newTag.shopId = ReactionCore.getShopId();
      newTag.updatedAt = new Date();
      newTag.createdAt = new Date();
      newTag._id = Tags.insert(newTag);
      Products.update(productId, {
        $push: {
          hashtags: newTag._id
        }
      });
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

    Products.update(productId, {
      $pull: {
        hashtags: tagId
      }
    });

    let productCount = Products.find({
      hashtags: {
        $in: [tagId]
      }
    }).count();

    let relatedTagsCount = Tags.find({
      relatedTagIds: {
        $in: [tagId]
      }
    }).count();

    if (productCount === 0 && relatedTagsCount === 0) {
      return Tags.remove(tagId);
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

    let product = Products.findOne(productId);
    let handle = getSlug(product.title);
    handle = ReactionCore.createHandle(handle, product._id);
    Products.update(product._id, {
      $set: {
        handle: handle
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
    this.unblock();

    let product = Products.findOne(productId);
    let tag = Tags.findOne(tagId);
    // set handle
    if (product.handle === tag.slug) {
      let handle = getSlug(product.title);
      handle = ReactionCore.createHandle(handle, product._id);
      Products.update(product._id, {
        $set: {
          handle: handle
        }
      });

      return handle;
    }
    // toggle hangle
    let existingHandles = Products.find({
      handle: tag.slug
    }).fetch();
    // this is needed to take care about product's handle which(product) was
    // previously tagged.
    for (let currentProduct of existingHandles) {
      let currentProductHandle = ReactionCore.createHandle(
        getSlug(currentProduct.title),
        currentProduct._id);
      Products.update(currentProduct._id, {
        $set: {
          handle: currentProductHandle
        }
      });
    }
    Products.update(product._id, {
      $set: {
        handle: tag.slug
      }
    });
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
    let product = Products.findOne({
      "_id": productId,
      "positions.tag": positionData.tag
    });

    function addPosition() {
      updateResult = Products.update({
        _id: productId
      }, {
        $addToSet: {
          positions: positionData
        },
        $set: {
          updatedAt: new Date()
        }
      }, function (error) {
        if (error) {
          ReactionCore.Log.warn(error);
          throw new Meteor.Error(403, error);
        }
      });
    }

    function updatePosition() {
      updateResult = Products.update({
        "_id": productId,
        "positions.tag": positionData.tag
      }, {
        $set: {
          "positions.$.position": positionData.position,
          "positions.$.pinned": positionData.pinned,
          "positions.$.weight": positionData.weight,
          "positions.$.updatedAt": new Date()
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
      return Products.update({
        _id: productId,
        metafields: meta
      }, {
        $set: {
          "metafields.$": updatedMeta
        }
      });
    }
    // adds metadata
    return Products.update({
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
   * @return {String} return
   */
  "products/publishProduct": function (productId) {
    check(productId, String);
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();

    let product = ReactionCore.Collections.Products.findOne(productId);

    if ((product !== null ? product.variants[0].price : void 0) && (
        product !== null ? product.variants[0].title : void 0) && (
        product !==
        null ? product.title : void 0)) {
      // update product visibility
      ReactionCore.Log.info("toggle product visibility ", product._id, !
        product.isVisible);

      Products.update(product._id, {
        $set: {
          isVisible: !product.isVisible
        }
      });
      return Products.findOne(product._id).isVisible;
    }
    ReactionCore.Log.debug("invalid product visibility ", productId);
    throw new Meteor.Error(400, "Bad Request");
  }
});
