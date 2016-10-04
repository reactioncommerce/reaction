import _ from  "lodash";
import { EJSON } from "meteor/ejson";
import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Catalog } from "/lib/api";
import { Media, Products, Revisions, Tags } from "/lib/collections";
import { Logger, Reaction } from "/server/api";

/**
 * Reaction Product Methods
 */
/* eslint new-cap: 0 */
/* eslint no-loop-func: 0 */
/* eslint quotes: 0 */

/**
 * @array toDenormalize
 * @summary contains a list of fields, which should be denormalized
 * @type {string[]}
 */
const toDenormalize = [
  "price",
  "inventoryQuantity",
  "lowInventoryWarningThreshold",
  "inventoryPolicy",
  "inventoryManagement"
];

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
  const titleCount = Products.find({
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
  const copySuffix = titleString.match(/-copy-\d+$/) || titleString.match(/-copy$/);
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
  if (Products.find({
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
  const handleCount = Products.find({
    handle: handle,
    _id: {
      $nin: [productId]
    }
  }).count();
  // current product "copy" number
  let handleNumberSuffix = 0;
  // product handle prefix
  let handleString = handle;
  // copySuffix "-copy-number" suffix of product
  const copySuffix = handleString.match(/-copy-\d+$/) || handleString.match(/-copy$/);

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
  if (Products.find({
    handle: handle
  }).count() !== 0) {
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
 * @return {Number} Media#update result
 */
function copyMedia(newId, variantOldId, variantNewId) {
  Media.find({
    "metadata.variantId": variantOldId
  }).forEach(function (fileObj) {
    const newFile = fileObj.copy();
    return newFile.update({
      $set: {
        "metadata.productId": newId,
        "metadata.variantId": variantNewId
      }
    });
  });
}

/**
 * @function denormalize
 * @description With flattened model we do not want to get variant docs in
 * `products` publication, but we need some data from variants to display price,
 * quantity, etc. That's why we are denormalizing these properties into product
 * doc. Also, this way should have a speed benefit comparing the way where we
 * could dynamically build denormalization inside `products` publication.
 * @summary update product denormalized properties if variant was updated or
 * removed
 * @param {String} id - product _id
 * @param {String} field - type of field. Could be:
 * "price",
 * "inventoryQuantity",
 * "inventoryManagement",
 * "inventoryPolicy",
 * "lowInventoryWarningThreshold"
 * @since 0.11.0
 * @return {Number} - number of successful update operations. Should be "1".
 */
function denormalize(id, field) {
  const doc = Products.findOne(id);
  let variants;
  if (doc.type === "simple") {
    variants = Catalog.getTopVariants(id);
  } else if (doc.type === "variant" && doc.ancestors.length === 1) {
    variants = Catalog.getVariants(id);
  }
  const update = {};

  switch (field) {
    case "inventoryPolicy":
    case "inventoryQuantity":
    case "inventoryManagement":
      Object.assign(update, {
        isSoldOut: isSoldOut(variants),
        isLowQuantity: isLowQuantity(variants),
        isBackorder: isBackorder(variants)
      });
      break;
    case "lowInventoryWarningThreshold":
      Object.assign(update, {
        isLowQuantity: isLowQuantity(variants)
      });
      break;
    default: // "price" is object with range, min, max
      const priceObject = Catalog.getProductPriceRange(id);
      Object.assign(update, {
        price: priceObject
      });
  }
  Products.update(id, {
    $set: update
  }, {
    selector: {
      type: "simple"
    }
  });
}

/**
 * isSoldOut
 * @description We are stop accepting new orders if product marked as
 * `isSoldOut`.
 * @param {Array} variants - Array with top-level variants
 * @return {Boolean} true if summary product quantity is zero.
 */
function isSoldOut(variants) {
  return variants.every(variant => {
    if (variant.inventoryManagement && variant.inventoryPolicy) {
      return Catalog.getVariantQuantity(variant) <= 0;
    }
    return false;
  });
}

/**
 * isLowQuantity
 * @description If at least one of the variants is less than the threshold,
 * then function returns `true`
 * @param {Array} variants - array of child variants
 * @return {boolean} low quantity or not
 */
function isLowQuantity(variants) {
  return variants.some(variant => {
    const quantity = Catalog.getVariantQuantity(variant);
    // we need to keep an eye on `inventoryPolicy` too and qty > 0
    if (variant.inventoryManagement && variant.inventoryPolicy && quantity) {
      return quantity <= variant.lowInventoryWarningThreshold;
    }
    // TODO: need to test this function with real data
    return false;
  });
}

/**
 * isBackorder
 * @description Is products variants is still available to be ordered after
 * summary variants quantity is zero
 * @param {Array} variants - array with variant objects
 * @return {boolean} is backorder allowed or now for a product
 */
function isBackorder(variants) {
  return variants.every(variant => {
    return !variant.inventoryPolicy && variant.inventoryManagement &&
      variant.inventoryQuantity === 0;
  });
}

/**
 * flushQuantity
 * @description if variant `inventoryQuantity` not zero, function update it to
 * zero. This needed in case then option with it's own `inventoryQuantity`
 * creates to top-level variant. In that case top-level variant should display
 * sum of his options `inventoryQuantity` fields.
 * @param {String} id - variant _id
 * @return {Number} - collection update results
 */
function flushQuantity(id) {
  const variant = Products.findOne(id);
  // if variant already have descendants, quantity should be 0, and we don't
  // need to do all next actions
  if (variant.inventoryQuantity === 0) {
    return 1; // let them think that we have one successful operation here
  }

  return Products.update({
    _id: id
  }, {
    $set: {
      inventoryQuantity: 0
    }
  }, {
    selector: {
      type: "variant"
    }
  });
}

Meteor.methods({
  /**
   * products/cloneVariant
   * @summary clones a product variant into a new variant
   * @description the method copies variants, but will also create and clone
   * child variants (options)
   * @param {String} productId - the productId we're whose variant we're
   * cloning
   * @param {String} variantId - the variantId that we're cloning
   * @todo rewrite @description
   * @return {Array} - list with cloned variants _ids
   */
  "products/cloneVariant": function (productId, variantId) {
    check(productId, String);
    check(variantId, String);
    // user needs createProduct permission to clone
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const variants = Products.find({
      $or: [{
        _id: variantId
      }, {
        ancestors: {
          $in: [variantId]
        }
      }],
      type: "variant"
    }).fetch();
    // exit if we're trying to clone a ghost
    if (variants.length === 0) {
      return;
    }
    const variantNewId = Random.id(); // for the parent variant
    // we need to make sure that top level variant will be cloned first, his
    // descendants later.
    // we could use this way in future: http://stackoverflow.com/questions/
    // 9040161/mongo-order-by-length-of-array, by now following are allowed
    // @link https://lodash.com/docs#sortBy
    const sortedVariants = _.sortBy(variants, doc => doc.ancestors.length);

    return sortedVariants.map(variant => {
      const oldId = variant._id;
      let type = "child";
      const clone = {};
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
      copyMedia(productId, oldId, clone._id);

      return Products.insert(clone, {
        validate: false
      }, (error, result) => {
        if (result) {
          if (type === "child") {
            Logger.info(
              `products/cloneVariant: created sub child clone: ${
                clone._id} from ${variantId}`
            );
          } else {
            Logger.info(
              `products/cloneVariant: created clone: ${
                clone._id} from ${variantId}`
            );
          }
        }
        if (error) {
          Logger.error(
            `products/cloneVariant: cloning of ${variantId} was failed: ${
              error}`
          );
        }
      });
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
    check(newVariant, Match.Optional(Object));
    // must have createProduct permissions
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const newVariantId = Random.id();
    // get parent ancestors to build new ancestors array
    const {
      ancestors
    } = Products.findOne(parentId);
    Array.isArray(ancestors) && ancestors.push(parentId);
    const assembledVariant = Object.assign(newVariant || {}, {
      _id: newVariantId,
      ancestors: ancestors,
      type: "variant"
    });

    if (!newVariant) {
      Object.assign(assembledVariant, {
        title: "",
        price: 0.00
      });
    }

    // if we are inserting child variant to top-level variant, we need to remove
    // all top-level's variant inventory records and flush it's quantity,
    // because it will be hold sum of all it descendants quantities.
    if (ancestors.length === 2) {
      flushQuantity(parentId);
    }

    Products.insert(assembledVariant,
      (error, result) => {
        if (result) {
          Logger.info(
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
   * only need to supply updated information. Currently used for a one use case
   * - to manage top-level variant autoform.
   * @param {Object} variant - current variant object
   * @todo some use cases of this method was moved to "products/
   * updateProductField", but it still used
   * @return {Number} returns update result
   */
  "products/updateVariant": function (variant) {
    check(variant, Object);
    // must have createProduct permissions
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const currentVariant = Products.findOne(variant._id);
    // update variants
    if (typeof currentVariant === "object") {
      const newVariant = Object.assign({}, currentVariant, variant);

      return Products.update({
        _id: variant._id
      }, {
        $set: newVariant // newVariant already contain `type` property, so we
          // do not need to pass it explicitly
      }, {
        validate: false
      }, (error, result) => {
        if (result) {
          const productId = currentVariant.ancestors[0];
          // we need manually check is these fields were updated?
          // we can't stop after successful denormalization, because we have a
          // case when several fields could be changed in top-level variant
          // before form will be submitted.
          toDenormalize.forEach(field => {
            if (currentVariant[field] !== variant[field]) {
              denormalize(productId, field);
            }
          });
        }
      });
    }
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
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const selector = {
      $or: [{
        _id: variantId
      }, {
        ancestors: {
          $in: [variantId]
        }
      }]
    };
    const toDelete = Products.find(selector).fetch();
    // out if nothing to delete
    if (!Array.isArray(toDelete) || toDelete.length === 0) return false;

    const deleted = Products.remove(selector);

    // after variant were removed from product, we need to recalculate all
    // denormalized fields
    const productId = toDelete[0].ancestors[0];
    toDenormalize.forEach(field => denormalize(productId, field));

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
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    // this.unblock();

    let result;
    let products;
    const results = [];
    const pool = []; // pool of id pairs: { oldId, newId }

    function getIds(id) {
      return pool.filter(function (pair) {
        return pair.oldId === this.id;
      }, {
        id: id
      });
    }

    function setId(ids) {
      return pool.push(ids);
    }

    function buildAncestors(ancestors) {
      const newAncestors = [];
      ancestors.map(oldId => {
        const pair = getIds(oldId);
        // TODO do we always have newId on this step?
        newAncestors.push(pair[0].newId);
      });
      return newAncestors;
    }

    if (!Array.isArray(productOrArray)) {
      products = [productOrArray];
    } else {
      products = productOrArray;
    }

    for (const product of products) {
      // cloning product
      const productNewId = Random.id();
      setId({
        oldId: product._id,
        newId: productNewId
      });

      const newProduct = Object.assign({}, product, {
        _id: productNewId
          // ancestors: product.ancestors.push(product._id)
      });
      delete newProduct.updatedAt;
      delete newProduct.createdAt;
      delete newProduct.publishedAt;
      delete newProduct.positions;
      delete newProduct.handle;
      newProduct.isVisible = false;
      if (newProduct.title) {
        // todo test this
        newProduct.title = createTitle(newProduct.title, newProduct._id);
        newProduct.handle = createHandle(
          Reaction.getSlug(newProduct.title),
          newProduct._id
        );
      }
      result = Products.insert(newProduct, {
        validate: false
      });
      results.push(result);

      // cloning variants
      const variants = Products.find({
        ancestors: {
          $in: [product._id]
        },
        type: "variant"
      }).fetch();
      // why we are using `_.sortBy` described in `products/cloneVariant`
      const sortedVariants = _.sortBy(variants, doc => doc.ancestors.length);
      for (const variant of sortedVariants) {
        const variantNewId = Random.id();
        setId({
          oldId: variant._id,
          newId: variantNewId
        });
        const ancestors = buildAncestors(variant.ancestors);
        const newVariant = Object.assign({}, variant, {
          _id: variantNewId,
          ancestors: ancestors
        });
        delete newVariant.updatedAt;
        delete newVariant.createdAt;
        delete newVariant.publishedAt; // TODO can variant have this param?

        result = Products.insert(
          newVariant, {
            validate: false
          }
        );
        copyMedia(productNewId, variant._id, variantNewId);
        results.push(result);
      }
    }
    return results;
  },

  /**
   * products/createProduct
   * @summary when we create a new product, we create it with an empty variant.
   * all products have a variant with pricing and details
   * @param {Object} [product] - optional product object
   * @return {String} return insert result
   */
  "products/createProduct": function (product) {
    check(product, Match.Optional(Object));
    // must have createProduct permission
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    // if a product object was provided
    if (product) {
      return Products.insert(product);
    }

    return Products.insert({
      type: "simple" // needed for multi-schema
    }, {
      validate: false
    }, (error, result) => {
      // additionally, we want to create a variant to a new product
      if (result) {
        Products.insert({
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
   * @returns {Number} returns number of removed products
   */
  "products/deleteProduct": function (productId) {
    check(productId, Match.OneOf(Array, String));
    // must have admin permission to delete
    if (!Reaction.hasPermission("createProduct") && !Reaction.hasAdminAccess()) {
      throw new Meteor.Error(403, "Access Denied");
    }

    let productIds;

    if (!Array.isArray(productId)) {
      productIds = [productId];
    } else {
      productIds = productId;
    }
    const productsWithVariants = Products.find({
      $or: [{
        _id: {
          $in: productIds
        }
      }, {
        ancestors: {
          $in: productIds
        }
      }]
    }, {
      fields: {
        type: 1
      }
    }).fetch();

    const ids = [];
    productsWithVariants.map(doc => {
      ids.push(doc._id);
    });

    Products.remove({
      _id: {
        $in: ids
      }
    });

    const numRemoved = Revisions.find({
      "documentId": {
        $in: ids
      },
      "documentData.isDeleted": true
    }).count();

    if (numRemoved > 0) {
      // we can get removes results only in async way
      Media.update({
        "metadata.productId": {
          $in: ids
        },
        "metadata.variantId": {
          $in: ids
        }
      }, {
        $set: {
          "metadata.isDeleted": true
        }
      });
      return numRemoved;
    }
    throw new Meteor.Error(304, "Something went wrong, nothing was deleted");
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
   * @return {Number} returns update result
   */
  "products/updateProductField": function (_id, field, value) {
    check(_id, String);
    check(field, String);
    check(value, Match.OneOf(String, Object, Array, Boolean));
    // must have createProduct permission
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const doc = Products.findOne(_id);
    const type = doc.type;
    let update;
    // handle booleans with correct typing
    if (value === "false" || value === "true") {
      update = EJSON.parse(`{${field}:${value}}`);
    } else {
      const stringValue = EJSON.stringify(value);
      update = EJSON.parse("{\"" + field + "\":" + stringValue + "}");
    }

    // we need to use sync mode here, to return correct error and result to UI
    const result = Products.update(_id, {
      $set: update
    }, {
      selector: {
        type: type
      }
    });

    if (typeof result === "number") {
      if (type === "variant" && ~toDenormalize.indexOf(field)) {
        denormalize(doc.ancestors[0], field);
      }
    }
    return result;
  },

  /**
   * products/updateProductTags
   * @summary method to insert or update tag with hierarchy
   * @param {String} productId - productId
   * @param {String} tagName - tagName
   * @param {String} tagId - tagId
   * @return {Number} return result
   */
  "products/updateProductTags": function (productId, tagName, tagId) {
    check(productId, String);
    check(tagName, String);
    check(tagId, Match.OneOf(String, null));
    // must have createProduct permission
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();

    const newTag = {
      slug: Reaction.getSlug(tagName),
      name: tagName
    };

    const existingTag = Tags.findOne({
      slug: Reaction.getSlug(tagName)
    });

    if (existingTag) {
      const productCount = Products.find({
        _id: productId,
        hashtags: {
          $in: [existingTag._id]
        }
      }).count();
      if (productCount > 0) {
        throw new Meteor.Error(403, "Existing Tag, Update Denied");
      }
      return Products.update(productId, {
        $push: {
          hashtags: existingTag._id
        }
      }, {
        selector: {
          type: "simple"
        }
      });
    } else if (tagId) {
      return Tags.update(tagId, {
        $set: newTag
      });
    }

    const newTagId = Meteor.call("shop/createTag", tagName, false);

    // if result is an Error object, we return it immediately
    if (typeof newTagId !== "string") {
      return newTagId;
    }

    return Products.update(productId, {
      $push: {
        hashtags: newTagId
      }
    }, {
      selector: {
        type: "simple"
      }
    });
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
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    Products.update(productId, {
      $pull: {
        hashtags: tagId
      }
    }, {
      selector: {
        type: "simple"
      }
    });
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
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const product = Products.findOne(productId);
    let handle = Reaction.getSlug(product.title);
    handle = createHandle(handle, product._id);
    Products.update(product._id, {
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
    if (!Reaction.hasPermission("createProduct")) {
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

    const product = Products.findOne(productId);
    const tag = Tags.findOne(tagId);
    // set handle
    if (product.handle === tag.slug) {
      let handle = Reaction.getSlug(product.title);
      handle = createHandle(handle, product._id);
      Products.update(product._id, getSet(handle));

      return handle;
    }
    // toggle handle
    const existingHandles = Products.find({
      handle: tag.slug
    }).fetch();
    // this is needed to take care about product's handle which(product) was
    // previously tagged.
    for (const currentProduct of existingHandles) {
      const currentProductHandle = createHandle(
        Reaction.getSlug(currentProduct.title),
        currentProduct._id);
      Products.update(currentProduct._id,
        getSet(currentProductHandle));
    }
    Products.update(product._id, getSet(tag.slug));

    return tag.slug;
  },

  /**
   * products/updateProductPosition
   * @summary update product grid positions
   * @param {String} productId - productId
   * @param {Object} positionData -  an object with position,dimensions
   * @param {String} tag - current route name. If it is not tag, then we using
   * shop name as base `positions` name. Could be useful for multi-shopping.
   * @return {Number} collection update returns
   */
  "products/updateProductPosition": function (productId, positionData, tag) {
    check(productId, String);
    check(positionData, Object);
    check(tag, String);
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }
    this.unblock();

    const positions = `positions.${tag}`;
    const product = Products.findOne({
      _id: productId,
      [positions]: {
        $exists: true
      }
    });

    function addPosition() {
      return Products.update({
        _id: productId
      }, {
        $set: {
          [positions]: positionData,
          updatedAt: new Date(),
          type: "simple" // for multi-schema
        }
      });
    }

    function updatePosition() {
      const position = `positions.${tag}.position`;
      const pinned = `positions.${tag}.pinned`;
      const weight = `positions.${tag}.weight`;
      const updatedAt = `positions.${tag}.updatedAt`;

      return Products.update({
        _id: productId
      }, {
        $set: {
          [position]: positionData.position,
          [pinned]: positionData.pinned,
          [weight]: positionData.weight,
          [updatedAt]: new Date(),
          type: "simple" // for multi-schema
        }
      });
    }

    if (product && product.positions && product.positions[tag]) {
      return updatePosition();
    }
    return addPosition();
  },

  /**
   * products/updateVariantsPosition
   * @description updates top level variant position index
   * @param {Array} sortedVariantIds - array of top level variant `_id`s
   * @since 0.11.0
   * @return {Number} Products.update result
   */
  "products/updateVariantsPosition": function (sortedVariantIds) {
    check(sortedVariantIds, [String]);
    // TODO: to make this work we need to remove auditArgumentsCheck I suppose
    // new SimpleSchema({
    //   sortedVariantIds: { type: [String] }
    // }).validate({ sortedVariantIds });

    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    sortedVariantIds.forEach((id, index) => {
      Products.update(id, {
        $set: {
          index: index
        }
      }, {
        selector: {
          type: "variant"
        }
      }, (error, result) => {
        if (result) {
          Logger.info(
            `Variant ${id} position was updated to index ${index}`
          );
        }
      });
    });
  },

  /**
   * products/updateMetaFields
   * @summary update product metafield
   * @param {String} productId - productId
   * @param {Object} updatedMeta - update object with metadata
   * @param {Object|Number|undefined|null} meta - current meta object, or a number index
   * @todo should this method works for variants also?
   * @return {Number} collection update result
   */
  "products/updateMetaFields": function (productId, updatedMeta, meta) {
    check(productId, String);
    check(updatedMeta, Object);
    check(meta, Match.OneOf(Object, Number, undefined, null));
    // must have createProduct permission
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    // update existing metadata
    if (typeof meta === "object") {
      return Products.update({
        _id: productId,
        metafields: meta
      }, {
        $set: {
          "metafields.$": updatedMeta
        }
      }, {
        selector: {
          type: "simple"
        }
      });
    } else if (typeof meta === "number") {
      return Products.update({
        _id: productId
      }, {
        $set: {
          [`metafields.${meta}`]: updatedMeta
        }
      }, {
        selector: {
          type: "simple"
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
    }, {
      selector: {
        type: "simple"
      }
    });
  },

  /**
   * products/removeMetaFields
   * @summary update product metafield
   * @param {String} productId - productId
   * @param {Object} metafields - metadata object to remove
   * @param {Object} type - optional product type for schema selection
   * @return {Number} collection update result
   */
  "products/removeMetaFields": function (productId, metafields, type = "simple") {
    check(productId, String);
    check(metafields, Object);
    check(type, String);

    // must have createProduct permission
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    return Products.update({
      _id: productId,
      type: type
    }, {
      $pull: {
        metafields: metafields
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
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const product = Products.findOne(productId);
    const variants = Products.find({
      ancestors: {
        $in: [productId]
      }
    }).fetch();
    let variantValidator = true;

    if (typeof product === "object" && product.title.length > 1) {
      if (variants.length > 0) {
        variants.forEach(variant => {
          // if this is a top variant with children, we avoid it to check price
          // because we using price of its children
          if (variant.ancestors.length === 1 &&
            !Catalog.getVariants(variant._id, "variant").length ||
            variant.ancestors.length !== 1) {
            if (!(typeof variant.price === "number" && variant.price > 0)) {
              variantValidator = false;
            }
          }
          // if variant has no title
          if (typeof variant.title === "string" && !variant.title.length) {
            variantValidator = false;
          }
          if (typeof optionTitle === "string" && !optionTitle.length) {
            variantValidator = false;
          }
        });
      } else {
        Logger.debug("invalid product visibility ", productId);
        throw new Meteor.Error(403, "Forbidden", "Variant is required");
      }

      if (!variantValidator) {
        Logger.debug("invalid product visibility ", productId);
        throw new Meteor.Error(403, "Forbidden",
          "Some properties are missing.");
      }

      // update product visibility
      Logger.info("toggle product visibility ", product._id, !product.isVisible);

      const res = Products.update(product._id, {
        $set: {
          isVisible: !product.isVisible
        }
      }, {
        selector: {
          type: "simple"
        }
      });

      // if collection updated we return new `isVisible` state
      return res === 1 && !product.isVisible;
    }
    Logger.debug("invalid product visibility ", productId);
    throw new Meteor.Error(400, "Bad Request");
  },
  /**
   * products/publishProduct
   * @summary publish (visibility) of product
   * @todo hook into publishing flow
   * @param {String} productId - productId
   * @return {Boolean} product.isVisible
   */
  "products/toggleVisibility": function (productId) {
    check(productId, String);
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error(403, "Access Denied");
    }

    const product = Products.findOne(productId);
    const res = Products.update(productId, {
      $set: {
        isVisible: !product.isVisible
      }
    }, {
      selector: {
        type: product.type
      }
    });

    // if collection updated we return new `isVisible` state
    return res === 1 && !product.isVisible;

    Logger.debug("invalid product visibility ", productId);
    throw new Meteor.Error(400, "Bad Request");
  }
});
