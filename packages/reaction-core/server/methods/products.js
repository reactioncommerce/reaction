/**
* Reaction Product Methods
*/

Meteor.methods({

  /*
   * the cloneVariant method copies variants, but will also create
   * and clone child variants (options)
   * productId,variantId to clone
   * add parentId to create children
   * Note: parentId and variantId can be the same if creating a child variant.
   */
  cloneVariant: function(productId, variantId, parentId) {
    var childClone, children, clone, product, variant, _i, _len;
    check(productId, String);
    check(variantId, String);
    check(parentId, Match.Optional(String));
    if (!ReactionCore.hasPermission('createProduct')) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    product = Products.findOne(productId);
    variant = (function() {
      var _i, _len, _ref, _results;
      _ref = product.variants;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        variant = _ref[_i];
        if (variant._id === variantId) {
          _results.push(variant);
        }
      }
      return _results;
    })();
    if (!(variant.length > 0)) {
      return false;
    }
    clone = variant[0];
    clone._id = Random.id();
    if (parentId) {
      ReactionCore.Log.debug("create child clone");
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
    clone.cloneId = productId;
    delete clone.updatedAt;
    delete clone.createdAt;
    delete clone.inventoryQuantity;
    delete clone.title;
    Products.update({
      _id: productId
    }, {
      $push: {
        variants: clone
      }
    }, {
      validate: false
    });
    children = (function() {
      var _i, _len, _ref, _results;
      _ref = product.variants;
      _results = [];
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        variant = _ref[_i];
        if (variant.parentId === variantId) {
          _results.push(variant);
        }
      }
      return _results;
    })();
    if (children.length > 0) {
      ReactionCore.Log.debug("clone children");
      for (_i = 0, _len = children.length; _i < _len; _i++) {
        childClone = children[_i];
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

  /*
   * initializes empty variant template (all others are clones)
   * should only be seen when all variants have been deleted from a product.
   */
  createVariant: function(productId, newVariant) {
    var newVariantId;
    check(productId, String);
    check(newVariant, Match.OneOf(Object, void 0));
    if (!ReactionCore.hasPermission('createProduct')) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    newVariantId = Random.id();
    if (newVariant) {
      newVariant._id = newVariantId;
      check(newVariant, ReactionCore.Schemas.ProductVariant);
    } else {
      newVariant = {
        "_id": newVariantId,
        "title": "",
        "price": 0.00
      };
    }
    Products.update({
      "_id": productId
    }, {
      $addToSet: {
        "variants": newVariant
      }
    }, {
      validate: false
    });
    return newVariantId;
  },

  /*
   * initializes inventory variant template
   * should only be called to create variants of type=inventory
   * pass newVariant object to create with options
   */
  createInventoryVariant: function(productId, parentId, newVariant) {
    var newBarcode, newVariantId;
    check(productId, String);
    check(parentId, String);
    check(newVariant, Match.OneOf(Object, void 0));
    this.unblock();
    if (!Roles.userIsInRole(Meteor.userId(), ['admin'])) {
      throw new Meteor.Error(403, "Access Denied");
    }
    newVariantId = Random.id();
    newBarcode = Random.id();
    if (newVariant) {
      newVariant._id = newVariantId;
      newVariant.parentId = parentId;
      newVariant.type = "inventory";
      check(newVariant, ReactionCore.Schemas.ProductVariant);
    } else {
      newVariant = {
        "_id": newVariantId,
        parentId: parentId,
        barcode: newBarcode,
        type: "inventory"
      };
    }
    Products.update({
      "_id": productId
    }, {
      $addToSet: {
        "variants": newVariant
      }
    }, {
      validate: false
    });
    return newVariantId;
  },

  /*
   * Creates default inventory variants for each quantity
   * Optional defaultValue will initialize all variants to some string + index
   */
  createInventoryVariants: function(productId, parentId, quantity, defaultValue) {
    var newVariantIds, newVariants;
    check(productId, String);
    check(parentId, String);
    check(defaultValue, Match.Optional(String));
    check(quantity, Match.OneOf(Match.Where(function() {
      check(quantity, String);
      return /[0-9]+/.test(quantity);
    }), Match.Where(function() {
      check(quantity, Number);
      return quantity > 0;
    })));
    this.unblock();
    if (!Roles.userIsInRole(Meteor.userId(), ["admin"])) {
      throw new Meteor.Error(403, "Access Denied");
    }
    newVariantIds = [];
    newVariants = [];
    _(Number(quantity)).times(function(index) {
      var newVariantBarcode, newVariantId;
      if (defaultValue || defaultValue === "") {
        newVariantBarcode = defaultValue + index;
      } else {
        newVariantBarcode = Random.id();
      }
      newVariantId = Random.id();
      newVariants.push({
        "_id": newVariantId,
        parentId: parentId,
        barcode: newVariantBarcode,
        type: "inventory"
      });
      return newVariantIds.push(newVariantId);
    });
    Products.update({
      "_id": productId
    }, {
      $addToSet: {
        "variants": {
          $each: newVariants
        }
      }
    }, {
      validate: false
    });
    return newVariantIds;
  },

  /*
   * update individual variant with new values, merges into original
   * only need to supply updated information
   */
  updateVariant: function(variant, updateDoc, currentDoc) {
    var Products, newVariant, product, value, variants, _i, _len, _ref;
    check(variant, Object);
    check(updateDoc, Match.OptionalOrNull(Object));
    check(currentDoc, Match.OptionalOrNull(String));
    if (!ReactionCore.hasPermission('createProduct')) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    Products = ReactionCore.Collections.Products;
    product = Products.findOne({
      "variants._id": variant._id
    });
    if (product != null ? product.variants : void 0) {
      _ref = product.variants;
      for (value = _i = 0, _len = _ref.length; _i < _len; value = ++_i) {
        variants = _ref[value];
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

  /*
   * update whole variants array
   */
  updateVariants: function(variants) {
    var product;
    check(variants, [Object]);
    if (!ReactionCore.hasPermission('createProduct')) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    product = Products.findOne({
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

  /*
   * delete variant, which should also delete child variants
   */
  deleteVariant: function(variantId) {
    var deleted;
    check(variantId, String);
    if (!ReactionCore.hasPermission('createProduct')) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    deleted = Products.find({
      $or: [
        {
          "variants.parentId": variantId
        }, {
          "variants._id": variantId
        }
      ]
    }).fetch();
    Products.update({
      "variants.parentId": variantId
    }, {
      $pull: {
        'variants': {
          'parentId': variantId
        }
      }
    });
    Products.update({
      "variants._id": variantId
    }, {
      $pull: {
        'variants': {
          '_id': variantId
        }
      }
    });
    _.each(deleted, function(product) {
      return _.each(product.variants, function(variant) {
        if (variant.parentId === variantId || variant._id === variantId) {
          return ReactionCore.Collections.Media.update({
            'metadata.variantId': variant._id
          }, {
            $unset: {
              'metadata.productId': "",
              'metadata.variantId': "",
              'metadata.priority': ""
            }
          }, {
            multi: true
          });
        }
      });
    });
    return true;
  },

  /*
   * clone a whole product, defaulting visibility, etc
   * in the future we are going to do an inheritance product
   * that maintains relationships with the cloned
   * product tree
   */
  cloneProduct: function(product) {
    var handleCount, i, newVariantId, oldVariantId;
    check(product, Object);
    if (!ReactionCore.hasPermission('createProduct')) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    i = 0;
    handleCount = Products.find({
      "cloneId": product._id
    }).count() + 1;
    product.cloneId = product._id;
    product._id = Random.id();
    delete product.updatedAt;
    delete product.createdAt;
    delete product.publishedAt;
    delete product.handle;
    product.isVisible = false;
    if (product.title) {
      product.title = product.title + handleCount;
    }
    while (i < product.variants.length) {
      newVariantId = Random.id();
      oldVariantId = product.variants[i]._id;
      product.variants[i]._id = newVariantId;
      ReactionCore.Collections.Media.find({
        'metadata.variantId': oldVariantId
      }).forEach(function(fileObj) {
        var newFile;
        newFile = fileObj.copy();
        return newFile.update({
          $set: {
            'metadata.productId': product._id,
            'metadata.variantId': newVariantId
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
    return Products.insert(product, {
      validate: false
    });
  },

  /*
   * when we create a new product, we create it with
   * an empty variant. all products have a variant
   * with pricing and details
   */
  createProduct: function(product) {
    check(product, Match.Optional(Object));
    if (!ReactionCore.hasPermission('createProduct')) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    if (product) {
      return Products.insert(product);
    } else {
      return Products.insert({
        _id: Random.id(),
        title: "",
        variants: [
          {
            _id: Random.id(),
            title: "",
            price: 0.00
          }
        ]
      }, {
        validate: false
      });
    }
  },

  /*
   * delete a product and unlink it from all media
   */
  deleteProduct: function(productId) {
    var numRemoved;
    check(productId, String);
    if (!ReactionCore.hasAdminAccess()) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    numRemoved = Products.remove(productId);
    if (numRemoved > 0) {
      ReactionCore.Collections.Media.update({
        'metadata.productId': productId
      }, {
        $unset: {
          'metadata.productId': "",
          'metadata.variantId': "",
          'metadata.priority': ""
        }
      }, {
        multi: true
      });
      return true;
    } else {
      return false;
    }
  },

  /*
   * update single product field
   */
  updateProductField: function(productId, field, value) {
    var update;
    check(productId, String);
    check(field, String);
    check(value, Match.OneOf(String, Object, Array, Boolean));
    if (!ReactionCore.hasPermission('createProduct')) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    value = EJSON.stringify(value);
    update = EJSON.parse("{\"" + field + "\":" + value + "}");
    return Products.update(productId, {
      $set: update
    });
  },

  /*
   * method to insert or update tag with hierachy
   * tagName will insert
   * tagName + tagId will update existing
   */
  updateProductTags: function(productId, tagName, tagId, currentTagId) {
    var existingTag, newTag, productCount;
    check(productId, String);
    check(tagName, String);
    check(tagId, Match.OneOf(String, null));
    check(currentTagId, Match.Optional(String));
    if (!ReactionCore.hasPermission('createProduct')) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    newTag = {
      slug: getSlug(tagName),
      name: tagName
    };
    existingTag = Tags.findOne({
      "name": tagName
    });
    if (existingTag) {
      productCount = Products.find({
        "_id": productId,
        "hashtags": {
          $in: [existingTag._id]
        }
      }).count();
      if (productCount > 0) {
        throw new Meteor.Error(403, "Existing Tag, Update Denied");
      }
      Products.update(productId, {
        $push: {
          "hashtags": existingTag._id
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
          "hashtags": newTag._id
        }
      });
    }
  },

  /*
   * remove product tag
   */
  removeProductTag: function(productId, tagId) {
    var productCount, relatedTagsCount;
    check(productId, String);
    check(tagId, String);
    if (!ReactionCore.hasPermission('createProduct')) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    Products.update(productId, {
      $pull: {
        "hashtags": tagId
      }
    });
    productCount = Products.find({
      "hashtags": {
        $in: [tagId]
      }
    }).count();
    relatedTagsCount = Tags.find({
      "relatedTagIds": {
        $in: [tagId]
      }
    }).count();
    if ((productCount === 0) && (relatedTagsCount === 0)) {
      return Tags.remove(tagId);
    }
  },

  /*
   * set or toggle product handle
   */
  setHandleTag: function(productId, tagId) {
    var currentProduct, existingHandles, product, tag, _i, _len;
    check(productId, String);
    check(tagId, String);
    if (!ReactionCore.hasPermission('createProduct')) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    product = Products.findOne(productId);
    tag = Tags.findOne(tagId);
    if (productId.handle === tag.slug) {
      Products.update(product._id, {
        $unset: {
          "handle": ""
        }
      });
      return product._id;
    } else {
      existingHandles = Products.find({
        handle: tag.slug
      }).fetch();
      for (_i = 0, _len = existingHandles.length; _i < _len; _i++) {
        currentProduct = existingHandles[_i];
        Products.update(currentProduct._id, {
          $unset: {
            "handle": ""
          }
        });
      }
      Products.update(product._id, {
        $set: {
          "handle": tag.slug
        }
      });
      return tag.slug;
    }
  },

  /*
   * update product grid positions
   * position is an object with tag,position,dimensions
   */
  updateProductPosition: function(productId, positionData) {
    check(productId, String);
    check(positionData, Object);

    if (!ReactionCore.hasPermission('createProduct')) {
      throw new Meteor.Error(403, "Access Denied");
    }

    this.unblock();

    var updateResult;
    var product = Products.findOne({
      '_id': productId,
      "positions.tag": positionData.tag
    });

    var addPosition = function () {
      updateResult = Products.update({
          _id: productId
        }, {
          $addToSet: {
            positions: positionData
          },
          $set: {
            updatedAt: new Date()
          }
        }, function(error, results) {
          if (error) {
            ReactionCore.Log.warn(error);
            throw new Meteor.Error(403, error);
          }
        });
    }

    var updatePosition = function () {
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
      }, function(error, results) {
        if (error) {
          ReactionCore.Log.warn(error);
          throw new Meteor.Error(403, error);
        }
      });
    }


    if ( typeof product === 'undefined' || product === null ) {
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
  updateMetaFields: function(productId, updatedMeta, meta) {
    check(productId, String);
    check(updatedMeta, Object);
    check(meta, Match.OptionalOrNull(Object));
    if (!ReactionCore.hasPermission('createProduct')) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    if (meta) {
      return Products.update({
        "_id": productId,
        "metafields": meta
      }, {
        $set: {
          "metafields.$": updatedMeta
        }
      });
    } else {
      return Products.update({
        "_id": productId
      }, {
        "$addToSet": {
          "metafields": updatedMeta
        }
      });
    }
  },
  publishProduct: function(productId) {
    var product, result;
    check(productId, String);
    if (!ReactionCore.hasPermission('createProduct')) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    product = ReactionCore.Collections.Products.findOne(productId);
    if ((product != null ? product.variants[0].price : void 0) && (product != null ? product.variants[0].title : void 0) && (product != null ? product.title : void 0)) {
      ReactionCore.Log.info("toggle product visibility ", product._id, !product.isVisible);
      result = Products.update(product._id, {
        $set: {
          isVisible: !product.isVisible
        }
      });
      return Products.findOne(product._id).isVisible;
    } else {
      ReactionCore.Log.debug("invalid product visibility ", productId);
      throw new Meteor.Error(400, "Bad Request");
    }
  }
});
