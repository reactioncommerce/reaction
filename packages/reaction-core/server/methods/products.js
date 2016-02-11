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
 * @param {String} handle - product `handle`
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
    const processVariants = id => {
      let results = [];
      for (let variant of product.variants) {
        if (typeof variant[id] === "string" && variant[id] === variantId) {
          results.push(variant);
        }
      }
      return results;
    };
    // user needs createProduct permission to clone
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();

    product = ReactionCore.Collections.Products.findOne(productId);
    // create variant hierachy structure
    const variant = processVariants("_id");

    // exit if we're trying to clone a ghost
    if (!(variant.length > 0)) {
      return false;
    }
    // variant is an array, with only
    // selected variant
    clone = Object.assign({}, variant[0]);
    // we use id with variant children
    clone._id = Random.id();

    // if this is going to be a child
    if (parentId) {
      ReactionCore.Log.info(
        "products/cloneVariant: create parent child clone from ",
        parentId);
      clone.parentId = variantId;
      delete clone.inventoryQuantity;
      ReactionCore.Collections.Products.update({
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
    clone.cloneId = variant[0]._id;
    delete clone.updatedAt;
    delete clone.createdAt;
    delete clone.inventoryQuantity;
    delete clone.title;
    // clone media
    copyMedia(productId, variant[0]._id, clone._id);

    // push the new variant to the product
    ReactionCore.Collections.Products.update({
      _id: productId
    }, {
      $push: {
        variants: clone
      }
    }, {
      validate: false
    });

    // process children
    children = processVariants("parentId");
    // if we have children
    if (children.length > 0) {
      ReactionCore.Log.info(
        "products/cloneVariant: create sub child clone from ", productId
      );
      for (let childClone of children) {
        const variantOldId = childClone._id;
        childClone.cloneId = variantOldId;
        childClone._id = Random.id();
        childClone.parentId = clone._id;
        /*ReactionCore.*/copyMedia(productId, variantOldId, childClone._id);
        ReactionCore.Collections.Products.update({
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
   * @param {Object} newVariant - variant object
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

    ReactionCore.Collections.Products.update({
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
    let product = ReactionCore.Collections.Products.findOne({
      "variants._id": variant._id
    });
    // update variants
    if (typeof product === "object" ? product.variants : void 0) {
      for (let variants of product.variants) {
        if (variants._id === variant._id) {
          newVariant = Object.assign({}, variants, variant);
        }
      }
      return ReactionCore.Collections.Products.update({
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
   * @returns {String} returns update results
   */
  "products/deleteVariant": function (variantId) {
    check(variantId, String);
    // must have createProduct permissions
    if (!ReactionCore.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();
    let deleted = ReactionCore.Collections.Products.find({
      $or: [{
        "variants.parentId": variantId
      }, {
        "variants._id": variantId
      }]
    }).fetch();
    ReactionCore.Collections.Products.update({
      "variants.parentId": variantId
    }, {
      $pull: {
        variants: {
          parentId: variantId
        }
      }
    });
    ReactionCore.Collections.Products.update({
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
   * @param {Object} productOrArray - product object to clone
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
      let j = 0;
      let handleCount = ReactionCore.Collections.Products.find({
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
        product.handle = createHandle(
          getSlug(product.title),
          product._id
        );
        product.handle = createHandle(
          getSlug(product.title),
          product._id
        );
        product.title = createTitle(
          product.title,
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
          while (j < product.variants.length) {
            if (product.variants[j].parentId === oldVariantId) {
              product.variants[j].parentId = newVariantId;
            }
            j++;
          }
        }
        i++;
      }
      let result = ReactionCore.Collections.Products.insert(product, {
        validate: false
      });
      results.push(result);
    }
    return results;
  },
  ///**
  // * products/cloneProduct
  // * @summary clone a whole product, defaulting visibility, etc
  // * in the future we are going to do an inheritance product
  // * that maintains relationships with the cloned product tree
  // * @param {Array} productOrArray - products array to clone
  // * @returns {Array} returns insert results
  // */
  //"products/cloneProduct": function (productOrArray) {
  //  check(productOrArray, Match.OneOf(Array, Object));
  //  // must have createProduct permissions
  //  if (!ReactionCore.hasPermission("createProduct")) {
  //    throw new Meteor.Error(403, "Access Denied");
  //  }
  //  this.unblock();
  //
  //  let products;
  //  let results = [];
  //  const processedVariants = [];
  //  let firstPassed = false; // indicates the iteration state through first variant
  //  /**
  //   * @private
  //   * @function cloneOptions
  //   * @description collect and clone options all of current product variant
  //   * @param {Object} product - original product
  //   * @param {String} variantOldId - original variant _id
  //   * @param {String} variantNewId - cloned variant _id
  //   * @param {String} newId - cloned product _id
  //   * @return {Array} options - all cloned options for cloned variant
  //   */
  //  const cloneOptions = (product, variantOldId, variantNewId, newId) => {
  //    const options = [];
  //    product.variants.map((variant) => {
  //      if (typeof variant.parentId === "string" &&
  //        variant.parentId === variantOldId) {
  //        const option = Object.assign({}, variant, {
  //          _id: Random.id(),
  //          cloneId: variant._id,
  //          parentId: variantNewId
  //        });
  //        delete option.updatedAt;
  //        delete option.createdAt;
  //        delete option.publishedAt;
  //        /*ReactionCore.*/copyMedia(newId, variant._id, option._id);
  //        options.push(option);
  //        processedVariants.push(variant._id);
  //      }
  //    });
  //
  //    return options;
  //  };
  //  /**
  //   * @private
  //   * @function cloneTopLevelClones
  //   * @description  named recursive function which is deeply cloning product
  //   * variants
  //   * @param {Object} originalProduct - product object
  //   * @param {String} newId - new _id for product
  //   * @param {Object} originalVariant - current variant
  //   * @return {Array}
  //   */
  //  const cloneTopLevelVariants = function cloneVariant(originalProduct, newId,
  //    originalVariant) {
  //    let clones = [];
  //    for (let variant of originalProduct.variants) {
  //      let result;
  //      if (variant.type === "variant" && ~processedVariants.indexOf(variant._id)) {
  //        // todo this `if` could be removed if decide to add cloneId to primary
  //        // default variant.
  //        // this is special case default product first variant
  //        // todo Problem here -- we should somehow to detect top-level variant.
  //        // simplest way to do it is to detect first variant in product: is check
  //        // on equality with `product.variants[0]._id`. This way can be buggy.
  //        if (!firstPassed &&
  //          originalVariant._id !== variant._id &&
  //          !variant.parentId &&
  //          variant._id === originalProduct.variants[0]._id
  //          /*!firstPassed &&
  //          ((originalVariant._id !== variant._id && !variant.cloneId &&
  //          !variant.parentId) || variant._id === originalProduct.variants[0]._id)*/) {
  //          firstPassed = true;
  //          result = cloneVariant(originalProduct, newId, variant);
  //          clones = clones.concat(result);
  //        }
  //
  //
  //        else if ((originalVariant._id !== variant._id &&
  //          typeof variant.cloneId === "string" &&
  //          typeof variant.parentId !== "string") //&& // to avoid child variants
  //          /*variant.cloneId === originalVariant._id*/ // go inside clones of variant
  //          ) { // first variant detection
  //          // this is a clone of "originalVariant"
  //          result = cloneVariant(originalProduct, newId, variant);
  //          clones = clones.concat(result);
  //        }
  //      }
  //    }
  //
  //    // we need somehow out from the recursion then we back from nesting up to
  //    // top. For now I see this way to do that, maybe it is not the best:
  //    if (originalVariant._id === originalProduct._id) {
  //      return clones;
  //    }
  //
  //    const variantOldId = originalVariant._id;
  //    const variantNewId = Random.id();
  //    const newVariant = Object.assign({}, originalVariant, {
  //      _id: variantNewId,
  //      cloneId: variantOldId
  //    });
  //    const options = cloneOptions(originalProduct, variantOldId, variantNewId, newId);
  //    /*ReactionCore.*/copyMedia(newId, variantOldId, variantNewId);
  //    delete newVariant.updatedAt;
  //    delete newVariant.createdAt;
  //    delete newVariant.publishedAt; // todo can variant have this param?
  //    processedVariants.push(variantOldId);
  //
  //    return [newVariant].concat(options).concat(clones);
  //  };
  //
  //  if (_.isArray(productOrArray) === false) {
  //    products = [productOrArray];
  //  } else {
  //    products = productOrArray;
  //  }
  //
  //  //for (let i = 0; i < products.length; i++) {
  //  for (let product of products) {
  //    // let product = products[i];
  //    // find all clones
  //    const productNewId = Random.id();
  //    let clonedVariants = cloneTopLevelVariants(product, productNewId,
  //      { _id: product._id });
  //    // clone current product
  //    let newProduct = Object.assign({}, product, { variants: clonedVariants });
  //    // end clean new clone
  //    newProduct.cloneId = product._id;
  //    newProduct._id = productNewId;
  //    delete newProduct.updatedAt;
  //    delete newProduct.createdAt;
  //    delete newProduct.publishedAt;
  //    // todo should we delete position?
  //    delete newProduct.handle;
  //    newProduct.isVisible = false;
  //    if (newProduct.title) {
  //      newProduct.handle = /*ReactionCore.*/createHandle(
  //        getSlug(newProduct.title),
  //        newProduct._id
  //      );
  //    }
  //    firstPassed = false; // make it clear for the next product
  //    let result = Products.insert(newProduct, {
  //      validate: false
  //    });
  //    results.push(result);
  //  }
  //
  //  return results;
  //},

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
    // default product
    return ReactionCore.Collections.Products.insert({
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

    let numRemoved = ReactionCore.Collections.Products.remove({
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

    return ReactionCore.Collections.Products.update(productId, {
      $set: update
    });
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
      newTag._id = ReactionCore.Collections.Tags.insert(newTag);
      ReactionCore.Collections.Products.update(productId, {
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

    ReactionCore.Collections.Products.update(productId, {
      $pull: {
        hashtags: tagId
      }
    });

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

    let product = ReactionCore.Collections.Products.findOne(productId);
    let tag = ReactionCore.Collections.Tags.findOne(tagId);
    // set handle
    if (product.handle === tag.slug) {
      let handle = getSlug(product.title);
      handle = createHandle(handle, product._id);
      ReactionCore.Collections.Products.update(product._id, {
        $set: {
          handle: handle
        }
      });

      return handle;
    }
    // toggle hangle
    let existingHandles = ReactionCore.Collections.Products.find({
      handle: tag.slug
    }).fetch();
    // this is needed to take care about product's handle which(product) was
    // previously tagged.
    for (let currentProduct of existingHandles) {
      let currentProductHandle = createHandle(
        getSlug(currentProduct.title),
        currentProduct._id);
      ReactionCore.Collections.Products.update(currentProduct._id, {
        $set: {
          handle: currentProductHandle
        }
      });
    }
    ReactionCore.Collections.Products.update(product._id, {
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
      updateResult = ReactionCore.Collections.Products.update({
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
        product !== null ? product.title : void 0)) {
      // update product visibility
      ReactionCore.Log.info("toggle product visibility ", product._id, !product.isVisible);

      ReactionCore.Collections.Products.update(product._id, {
        $set: {
          isVisible: !product.isVisible
        }
      });
      return ReactionCore.Collections.Products.findOne(product._id).isVisible;
    }
    ReactionCore.Log.debug("invalid product visibility ", productId);
    throw new Meteor.Error(400, "Bad Request");
  }
});
