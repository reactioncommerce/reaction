import _ from "lodash";
import { check, Match } from "meteor/check";
import { Random } from "meteor/random";
import { EJSON } from "meteor/ejson";
import { Meteor } from "meteor/meteor";
import { ReactionProduct } from "/lib/api";
import { ProductRevision as Catalog } from "/imports/plugins/core/revisions/server/hooks";
import { Hooks, Logger, Reaction } from "/server/api";
import { MediaRecords, Products, Revisions, Tags } from "/lib/collections";
import { Media } from "/imports/plugins/core/files/server";

/* eslint new-cap: 0 */
/* eslint no-loop-func: 0 */
/* eslint quotes: 0 */

/**
 * @file Methods for Products. Run these methods using `Meteor.call()`.
 *
 *
 * @namespace Methods/Products
*/

/**
 * updateVariantProductField
 * @private
 * @summary updates the variant
 * @param {Array} variants - the array of variants
 * @param {String} field - the field to update
 * @param {String} value - the value to add
 * @return {Array} - return an array
 */
function updateVariantProductField(variants, field, value) {
  return variants.map((variant) => Meteor.call("products/updateProductField", variant._id, field, value));
}

/**
 * @array toDenormalize
 * @private
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
 * @private
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
    title,
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
      title = `${titleString}-copy${titleCount > 1 ? `-${titleCount}` : ""}`;
    }
  }

  // we should check again if there are any new matches with DB
  if (Products.find({
    title
  }).count() !== 0) {
    title = createTitle(title, productId);
  }
  return title;
}

/**
 * @function createHandle
 * @private
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
    handle,
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
      handle = `${handleString}-copy${handleCount > 1 ? `-${handleCount}` : ''}`;
    }
  }

  // we should check again if there are any new matches with DB
  // exception product._id needed for cases then double triggering happens
  const newHandleCount = Products.find({
    handle,
    _id: {
      $nin: [productId]
    }
  }).count();

  if (newHandleCount !== 0) {
    handle = createHandle(handle, productId);
  }

  return handle;
}

/**
 * @function copyMedia
 * @private
 * @description copy images links to cloned variant from original
 * @param {String} newId - [cloned|original] product _id
 * @param {String} variantOldId - old variant _id
 * @param {String} variantNewId - - cloned variant _id
 * @return {undefined}
 */
function copyMedia(newId, variantOldId, variantNewId) {
  Media.find({
    "metadata.variantId": variantOldId
  })
    .then((fileRecords) => {
      fileRecords.forEach((fileRecord) => {
        // Copy File and insert directly, bypasing revision control
        fileRecord.fullClone({
          productId: newId,
          variantId: variantNewId
        }).catch((error) => {
          Logger.error(`Error in copyMedia for product ${newId}`, error);
        });
      });
    })
    .catch((error) => {
      Logger.error(`Error in copyMedia for product ${newId}`, error);
    });
}

/**
 * @function denormalize
 * @private
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
    default: { // "price" is object with range, min, max
      const priceObject = Catalog.getProductPriceRange(id);
      Object.assign(update, {
        price: priceObject
      });
    }
  }

  // TODO: Determine if product revision needs to be updated as well.
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
 * @private
 * @summary We are stop accepting new orders if product marked as `isSoldOut`.
 * @param {Array} variants - Array with top-level variants
 * @return {Boolean} true if summary product quantity is zero.
 */
function isSoldOut(variants) {
  return variants.every((variant) => {
    if (variant.inventoryManagement && variant.inventoryPolicy) {
      return Catalog.getVariantQuantity(variant) <= 0;
    }
    return false;
  });
}

/**
 * isLowQuantity
 * @private
 * @summary If at least one of the variants is less than the threshold, then function returns `true`
 * @param {Array} variants - array of child variants
 * @return {boolean} low quantity or not
 */
function isLowQuantity(variants) {
  return variants.some((variant) => {
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
 * @private
 * @description Is products variants is still available to be ordered after summary variants quantity is zero
 * @param {Array} variants - array with variant objects
 * @return {boolean} is backorder allowed or not for a product
 */
function isBackorder(variants) {
  return variants.every((variant) => !variant.inventoryPolicy && variant.inventoryManagement &&
      variant.inventoryQuantity === 0);
}

/**
 * flushQuantity
 * @private
 * @summary if variant `inventoryQuantity` not zero, function update it to
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

  const productUpdate = Products.update({
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

  return productUpdate;
}

/**
 * @function createProduct
 * @private
 * @description creates a product
 * @param {Object} props - initial product properties
 * @return {Object} product - new product
 */
function createProduct(props = null) {
  const _id = Products.insert({
    type: "simple",
    ...props
  }, {
    validate: false
  });

  const newProduct = Products.findOne({ _id });

  Hooks.Events.run("afterInsertCatalogProduct", newProduct);

  return newProduct;
}

/**
 * @function
 * @name updateCatalogProduct
 * @summary Updates a product's revision and conditionally updates
 * the underlying product.
 *
 * @param {String} userId - currently logged in user
 * @param {Object} selector - selector for product to update
 * @param {Object} modifier - Object describing what parts of the document to update.
 * @param {Object} validation - simple schema validation options
 * @return {String} _id of updated document
 */
function updateCatalogProduct(userId, selector, modifier, validation) {
  const product = Products.findOne(selector);

  const shouldUpdateProduct = Hooks.Events.run("beforeUpdateCatalogProduct", product, {
    userId,
    modifier,
    validation
  });

  if (shouldUpdateProduct) {
    const result = Products.update(selector, modifier, validation);

    Hooks.Events.run("afterUpdateCatalogProduct", product, { modifier });

    return result;
  }

  Logger.debug(`beforeUpdateCatalogProduct hook returned falsy, not updating catalog product`);

  return false;
}


Meteor.methods({
  /**
   * @name products/cloneVariant
   * @memberof Methods/Products
   * @method
   * @summary clones a product variant into a new variant
   * @description the method copies variants, but will also create and clone
   * child variants (options)
   * @param {String} productId - the productId we're whose variant we're
   * cloning
   * @param {String} variantId - the variantId that we're cloning
   * @todo rewrite @description
   * @return {Array} - list with cloned variants _ids
   */
  "products/cloneVariant"(productId, variantId) {
    check(productId, String);
    check(variantId, String);

    // Check first if Variant exists and then if user has the right to clone it
    const variant = Products.findOne(variantId);
    if (!variant) {
      throw new Meteor.Error("not-found", "Variant not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, variant.shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    // Verify that this variant and any ancestors are not deleted.
    // Child variants cannot be added if a parent product or product revision
    // is marked as `{ isDeleted: true }`
    if (ReactionProduct.isAncestorDeleted(variant, true)) {
      throw new Meteor.Error("server-error", "Unable to create product variant");
    }

    const variants = Products.find({
      $or: [{
        _id: variantId
      }, {
        ancestors: {
          $in: [variantId]
        },
        isDeleted: false
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
    const sortedVariants = _.sortBy(variants, (doc) => doc.ancestors.length);

    return sortedVariants.map((sortedVariant) => {
      const oldId = sortedVariant._id;
      let type = "child";
      const clone = {};
      if (variantId === sortedVariant._id) {
        type = "parent";
        Object.assign(clone, sortedVariant, {
          _id: variantNewId,
          title: `${sortedVariant.title} - copy`,
          optionTitle: `${sortedVariant.optionTitle} - copy`,
          price: `${sortedVariant.price}` ?
            `${sortedVariant.price}` :
            `${variant.price}`,
          compareAtPrice: `${sortedVariant.compareAtPrice}` ?
            `${sortedVariant.compareAtPrice}` :
            `${variant.compareAtPrice}`
        });
      } else {
        const parentIndex = sortedVariant.ancestors.indexOf(variantId);
        const ancestorsClone = sortedVariant.ancestors.slice(0);
        // if variantId exists in ancestors, we override it by new _id
        if (parentIndex >= 0) ancestorsClone.splice(parentIndex, 1, variantNewId);
        Object.assign(clone, variant, {
          _id: Random.id(),
          ancestors: ancestorsClone,
          title: `${sortedVariant.title}`,
          optionTitle: `${sortedVariant.optionTitle}`,
          price: `${sortedVariant.price}` ?
            `${sortedVariant.price}` :
            `${variant.price}`,
          compareAtPrice: `${sortedVariant.compareAtPrice}` ?
            `${sortedVariant.compareAtPrice}` :
            `${variant.compareAtPrice}`,
          height: `${sortedVariant.height}`,
          width: `${sortedVariant.width}`,
          weight: `${sortedVariant.weight}`,
          length: `${sortedVariant.length}`
        });
      }
      delete clone.updatedAt;
      delete clone.createdAt;
      delete clone.inventoryQuantity;
      delete clone.lowInventoryWarningThreshold;

      copyMedia(productId, oldId, clone._id);

      let newId;
      try {
        Hooks.Events.run("beforeInsertCatalogProductInsertRevision", clone);
        newId = Products.insert(clone, { validate: false });
        const newProduct = Products.findOne(newId);
        Hooks.Events.run("afterInsertCatalogProduct", newProduct);
        Logger.debug(`products/cloneVariant: created ${type === "child" ? "sub child " : ""}clone: ${
          clone._id} from ${variantId}`);
      } catch (error) {
        Logger.error(`products/cloneVariant: cloning of ${variantId} was failed: ${error}`);
        throw error;
      }

      Hooks.Events.run("afterInsertProduct", clone);

      return newId;
    });
  },

  /**
   * @name products/createVariant
   * @memberof Methods/Products
   * @method
   * @summary initializes empty variant template
   * @param {String} parentId - the product _id or top level variant _id where
   * we create variant
   * @param {Object} [newVariant] - variant object
   * @return {String} new variantId
   */
  "products/createVariant"(parentId, newVariant) {
    check(parentId, String);
    check(newVariant, Match.Optional(Object));

    // Check first if Product exists and then if user has the rights
    const product = Products.findOne(parentId);
    if (!product) {
      throw new Meteor.Error("not-found", "Product not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, product.shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    const newVariantId = Random.id();
    // get parent ancestors to build new ancestors array
    const { ancestors } = product;

    // Verify that the parent variant and any ancestors are not deleted.
    // Child variants cannot be added if a parent product or product revision
    // is marked as `{ isDeleted: true }`
    if (ReactionProduct.isAncestorDeleted(product, true)) {
      throw new Meteor.Error("server-error", "Unable to create product variant");
    }

    Array.isArray(ancestors) && ancestors.push(parentId);
    const assembledVariant = Object.assign(newVariant || {}, {
      _id: newVariantId,
      ancestors,
      type: "variant"
    });

    if (!newVariant) {
      Object.assign(assembledVariant, {
        title: `${product.title} - Untitled option`,
        price: 0.00
      });
    }

    // if we are inserting child variant to top-level variant, we need to remove
    // all top-level's variant inventory records and flush it's quantity,
    // because it will be hold sum of all it descendants quantities.
    if (ancestors.length === 2) {
      flushQuantity(parentId);
    }

    Hooks.Events.run("beforeInsertCatalogProduct", assembledVariant);
    const _id = Products.insert(assembledVariant);
    Hooks.Events.run("afterInsertCatalogProduct", assembledVariant);

    Hooks.Events.run("afterInsertCatalogProductInsertRevision", Products.findOne({ _id }));

    Logger.debug(`products/createVariant: created variant: ${newVariantId} for ${parentId}`);

    return newVariantId;
  },

  /**
   * @name products/updateVariant
   * @memberof Methods/Products
   * @method
   * @summary update individual variant with new values, merges into original
   * only need to supply updated information. Currently used for a one use case
   * - to manage top-level variant autoform.
   * @param {Object} variant - current variant object
   * @todo some use cases of this method was moved to "products/
   * updateProductField", but it still used
   * @return {Number} returns update result
   */
  "products/updateVariant"(variant) {
    check(variant, Object);

    // Check first if Variant exists and then if user has the right to clone it
    const currentVariant = Products.findOne(variant._id);
    if (!currentVariant) {
      throw new Meteor.Error("not-found", "Variant not found");
    }

    if (!Reaction.hasPermission("createProduct", this.userId, currentVariant.shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    const newVariant = Object.assign({}, currentVariant, variant);

    const variantUpdateResult = updateCatalogProduct(
      this.userId,
      {
        _id: variant._id
      },
      {
        $set: newVariant
      },
      {
        selector: { type: currentVariant.type },
        validate: false
      }
    );

    const productId = currentVariant.ancestors[0];
    // we need manually check is these fields were updated?
    // we can't stop after successful denormalization, because we have a
    // case when several fields could be changed in top-level variant
    // before form will be submitted.
    toDenormalize.forEach((field) => {
      if (currentVariant[field] !== variant[field]) {
        denormalize(productId, field);
      }
    });

    return variantUpdateResult;
  },

  /**
   * @name products/deleteVariant
   * @memberof Methods/Products
   * @method
   * @summary delete variant, which should also delete child variants
   * @param {String} variantId - variantId to delete
   * @returns {Boolean} returns update results: `true` - if at least one variant
   * was removed or `false` if nothing was removed
   */
  "products/deleteVariant"(variantId) {
    check(variantId, String);

    // Check first if Variant exists and then if user has the right to delete it
    const variant = Products.findOne(variantId);
    if (!variant) {
      throw new Meteor.Error("not-found", "Variant not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, variant.shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    const selector = {
      // Don't "archive" variants that are already marked deleted.
      isDeleted: {
        $in: [false, undefined]
      },
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

    // Flag the variant and all its children as deleted in Revisions collection.
    toDelete.forEach((product) => {
      Hooks.Events.run("beforeRemoveCatalogProduct", product, { userId: this.userId });
      Hooks.Events.run("afterRemoveCatalogProduct", this.userId, product);
    });

    // After variant was removed from product, we need to recalculate all
    // denormalized fields
    const productId = toDelete[0].ancestors[0];
    toDenormalize.forEach((field) => denormalize(productId, field));

    Logger.debug(`Flagged variant and all its children as deleted.`);

    return true;
  },

  /**
   * @name products/cloneProduct
   * @memberof Methods/Products
   * @method
   * @summary clone a whole product, defaulting visibility, etc
   * in the future we are going to do an inheritance product
   * that maintains relationships with the cloned product tree
   * @param {Array} productOrArray - products array to clone
   * @returns {Array} returns insert results
   */
  "products/cloneProduct"(productOrArray) {
    check(productOrArray, Match.OneOf(Array, Object));

    // REVIEW: This check may be unnecessary now - checks that user has permission to clone
    // for active shop
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    if (Array.isArray(productOrArray)) {
      // Reduce to unique shops found among producs in this array
      const shopIds = productOrArray.map((prod) => prod.shopId);
      const uniqueShopIds = [...new Set(shopIds)];

      // For each unique shopId check to make sure that user has permission to clone
      uniqueShopIds.forEach((shopId) => {
        if (!Reaction.hasPermission("createProduct", this.userId, shopId)) {
          throw new Meteor.Error(
            "access-denied",
            "Access Denied"
          );
        }
      });
    } else if (!Reaction.hasPermission("createProduct", this.userId, productOrArray.shopId)) { // Single product was passed in - ensure that user has permission to clone
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    let result;
    let products;
    const results = [];
    const pool = []; // pool of id pairs: { oldId, newId }

    function getIds(id) {
      return pool.filter(function (pair) {
        return pair.oldId === this.id;
      }, {
        id
      });
    }

    function setId(ids) {
      return pool.push(ids);
    }

    function buildAncestors(ancestors) {
      const newAncestors = [];
      ancestors.map((oldId) => {
        const pair = getIds(oldId);
        // TODO do we always have newId on this step?
        newAncestors.push(pair[0].newId);
        return newAncestors;
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
      Hooks.Events.run("beforeInsertCatalogProductInsertRevision", newProduct);
      result = Products.insert(newProduct, { validate: false });
      Hooks.Events.run("afterInsertCatalogProduct", newProduct);
      results.push(result);

      // cloning variants
      const variants = Products.find({
        ancestors: {
          $in: [product._id]
        },
        type: "variant"
      }).fetch();
      // why we are using `_.sortBy` described in `products/cloneVariant`
      const sortedVariants = _.sortBy(variants, (doc) => doc.ancestors.length);
      for (const variant of sortedVariants) {
        const variantNewId = Random.id();
        setId({
          oldId: variant._id,
          newId: variantNewId
        });
        const ancestors = buildAncestors(variant.ancestors);
        const newVariant = Object.assign({}, variant, {
          _id: variantNewId,
          ancestors
        });
        delete newVariant.updatedAt;
        delete newVariant.createdAt;
        delete newVariant.publishedAt; // TODO can variant have this param?

        Hooks.Events.run("beforeInsertCatalogProductInsertRevision", newVariant);
        result = Products.insert(newVariant, { validate: false });
        Hooks.Events.run("afterInsertCatalogProduct", newVariant);
        copyMedia(productNewId, variant._id, variantNewId);
        results.push(result);
      }
    }
    return results;
  },

  /**
   * @name products/createProduct
   * @memberof Methods/Products
   * @method
   * @summary when we create a new product, we create it with an empty variant.
   * all products have a variant with pricing and details
   * @param {Object} [product] - optional product object
   * @return {String} The new product ID
   */
  "products/createProduct"(product) {
    check(product, Match.Optional(Object));

    // Ensure user has createProduct permission for active shop
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    // also if a product is provided, check first that the user doesn't mock a shop with no permissions to it
    if (product) {
      if (!product.shopId || !Reaction.hasPermission("createProduct", this.userId, product.shopId)) {
        throw new Meteor.Error("invalid-parameter", "Product should have a valid shopId");
      }

      // Create product revision
      Hooks.Events.run("beforeInsertCatalogProductInsertRevision", product);

      return Products.insert(product);
    }

    const newSimpleProduct = createProduct();

    // Create simple product revision
    Hooks.Events.run("afterInsertCatalogProductInsertRevision", newSimpleProduct);

    const newVariant = createProduct({
      ancestors: [newSimpleProduct._id],
      price: 0.00,
      title: "",
      type: "variant" // needed for multi-schema
    });

    // Create variant revision
    Hooks.Events.run("afterInsertCatalogProductInsertRevision", newVariant);

    return newSimpleProduct._id;
  },

  /**
   * @name products/archiveProduct
   * @memberof Methods/Products
   * @method
   * @summary archive a product and unlink it from all media
   * @param {String} productId - productId to delete
   * @returns {Number} returns number of removed products
   */
  "products/archiveProduct"(productId) {
    check(productId, Match.OneOf(Array, String));

    let extractedProductId;
    if (Array.isArray(productId)) {
      [extractedProductId] = productId;
    }

    // Check first if Product exists and then if user has the right to delete it
    const product = Products.findOne(extractedProductId || productId);
    if (!product) {
      throw new Meteor.Error("not-found", "Product not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, product.shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    let productIds;

    if (!Array.isArray(productId)) {
      productIds = [productId];
    } else {
      productIds = productId;
    }
    const productsWithVariants = Products.find({
      // Don't "archive" products that are already marked deleted.
      isDeleted: {
        $in: [false, undefined]
      },
      $or: [{
        _id: {
          $in: productIds
        }
      }, {
        ancestors: {
          $in: productIds
        }
      }]
    }).fetch();

    const ids = [];
    productsWithVariants.map((doc) => {
      ids.push(doc._id);
      return ids;
    });

    // Flag the product and all its variants as deleted in the Revisions collection.
    productsWithVariants.forEach((toArchiveProduct) => {
      Hooks.Events.run("beforeRemoveCatalogProduct", toArchiveProduct, { userId: this.userId });

      Hooks.Events.run("afterRemoveCatalogProduct", this.userId, toArchiveProduct);
    });

    const numFlaggedAsDeleted = Revisions.find({
      "documentId": {
        $in: ids
      },
      "documentData.isDeleted": true
    }).count();

    if (numFlaggedAsDeleted > 0) {
      // Flag associated MediaRecords as deleted.
      MediaRecords.update({
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
      return numFlaggedAsDeleted;
    }

    Logger.debug(`${numFlaggedAsDeleted} products have been flagged as deleted`);
  },

  /**
   * @name products/updateProductField
   * @memberof Methods/Products
   * @method
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
  "products/updateProductField"(_id, field, value) {
    check(_id, String);
    check(field, String);
    check(value, Match.OneOf(String, Object, Array, Boolean, Number));

    // Must have createProduct permission for active shop
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    // Check first if Product exists and then if user has the right to alter it
    const doc = Products.findOne(_id);
    if (!doc) {
      throw new Meteor.Error("not-found", "Product not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, doc.shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    const { type } = doc;
    let update;
    // handle booleans with correct typing
    if (value === "false" || value === "true") {
      const booleanValue = (value === "true" || value === true);
      update = EJSON.parse(`{"${field}":${booleanValue}}`);
    } else if (field === "handle") {
      update = {
        // TODO: write function to ensure new handle is unique.
        // Should be a call similar to the line below.
        [field]: createHandle(value, _id) // handle should be unique
      };
    } else if (field === "title" && doc.handle === doc._id) { // update handle once title is set
      const handle = createHandle(Reaction.getSlug(value), _id);
      update = {
        [field]: value,
        handle
      };
    } else {
      const stringValue = EJSON.stringify(value);
      update = EJSON.parse(`{"${field}":${stringValue}}`);
    }


    // we need to use sync mode here, to return correct error and result to UI
    let result;

    try {
      result = updateCatalogProduct(
        this.userId,
        {
          _id
        },
        {
          $set: update
        },
        {
          selector: { type }
        }
      );
    } catch (e) {
      throw new Meteor.Error("server-error", e.message);
    }

    // If we get a result from the product update,
    // meaning the update went past revision control,
    // denormalize and attach results to top-level product
    if (result === 1) {
      if (type === "variant" && toDenormalize.indexOf(field) >= 0) {
        denormalize(doc.ancestors[0], field);
      }
    }
    return result;
  },

  /**
   * @name products/updateProductTags
   * @memberof Methods/Products
   * @method
   * @summary method to insert or update tag with hierarchy
   * @param {String} productId - productId
   * @param {String} tagName - tagName
   * @param {String} tagId - tagId
   * @return {Number} return result
   */
  "products/updateProductTags"(productId, tagName, tagId) {
    check(productId, String);
    check(tagName, String);
    check(tagId, Match.OneOf(String, null));

    // Check first if Product exists and then if user has the right to alter it
    const product = Products.findOne(productId);
    if (!product) {
      throw new Meteor.Error("not-found", "Product not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, product.shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
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
        throw new Meteor.Error("server-error", "Existing Tag, Update Denied");
      }
      return updateCatalogProduct(
        this.userId,
        {
          _id: productId
        },
        {
          $push: {
            hashtags: existingTag._id
          }
        },
        {
          selector: { type: "simple" }
        }
      );
    } else if (tagId) {
      return Tags.update(tagId, { $set: newTag });
    }

    const newTagId = Meteor.call("shop/createTag", tagName, false);

    // if result is an Error object, we return it immediately
    if (typeof newTagId !== "string") {
      return newTagId;
    }

    return updateCatalogProduct(
      this.userId,
      {
        _id: productId
      },
      {
        $push: {
          hashtags: newTagId
        }
      },
      {
        selector: { type: "simple" }
      }
    );
  },

  /**
   * @name products/removeProductTag
   * @memberof Methods/Products
   * @method
   * @summary method to remove tag from product
   * @param {String} productId - productId
   * @param {String} tagId - tagId
   * @return {String} return update result
   */
  "products/removeProductTag"(productId, tagId) {
    check(productId, String);
    check(tagId, String);

    // Check first if Product exists and then if user has the right to alter it
    const product = Products.findOne(productId);
    if (!product) {
      throw new Meteor.Error("not-found", "Product not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, product.shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    updateCatalogProduct(
      this.userId,
      {
        _id: productId
      },
      {
        $pull: {
          hashtags: tagId
        }
      },
      {
        selector: { type: "simple" }
      }
    );
  },

  /**
   * @name products/setHandle
   * @memberof Methods/Products
   * @method
   * @summary copy of "products/setHandleTag", but without tag
   * @param {String} productId - productId
   * @returns {String} handle - product handle
   */
  "products/setHandle"(productId) {
    check(productId, String);

    // Check first if Product exists and then if user has the right to alter it
    const product = Products.findOne(productId);
    if (!product) {
      throw new Meteor.Error("not-found", "Product not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, product.shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    let handle = Reaction.getSlug(product.title);
    handle = createHandle(handle, product._id);
    updateCatalogProduct(
      this.userId,
      {
        _id: product._id
      },
      {
        $set: { handle, type: "simple" }
      },
    );

    return handle;
  },

  /**
   * @name products/setHandleTag
   * @memberof Methods/Products
   * @method
   * @summary set or toggle product handle
   * @param {String} productId - productId
   * @param {String} tagId - tagId
   * @return {String} return update result
   */
  "products/setHandleTag"(productId, tagId) {
    check(productId, String);
    check(tagId, String);
    // Check first if Product exists and then if user has the right to alter it
    const product = Products.findOne(productId);
    if (!product) {
      throw new Meteor.Error("not-found", "Product not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, product.shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    function getSet(handle) {
      return {
        $set: {
          handle,
          type: "simple"
        }
      };
    }

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
        currentProduct._id
      );
      updateCatalogProduct(
        this.userId,
        {
          _id: currentProduct._id
        },
        getSet(currentProductHandle)
      );
    }

    updateCatalogProduct(
      this.userId,
      {
        _id: product._id
      },
      getSet(tag.slug)
    );

    return tag.slug;
  },

  /**
   * @name products/updateProductPosition
   * @memberof Methods/Products
   * @method
   * @summary update product grid positions
   * @param {String} productId - productId
   * @param {Object} positionData -  an object with position,dimensions
   * @param {String} tag - current route name. If it is not tag, then we using
   * shop name as base `positions` name. Could be useful for multi-shopping.
   * @return {Number} collection update returns
   */
  "products/updateProductPosition"(productId, positionData, tag) {
    check(productId, String);
    check(positionData, Object);
    check(tag, String);

    // Check first if Product exists and then if user has the proper rights
    const product = Products.findOne(productId);
    if (!product) {
      throw new Meteor.Error("not-found", "Product not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, product.shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    this.unblock();

    const position = `positions.${tag}.position`;
    const pinned = `positions.${tag}.pinned`;
    const weight = `positions.${tag}.weight`;
    const updatedAt = `positions.${tag}.updatedAt`;

    return updateCatalogProduct(
      this.userId,
      {
        _id: productId
      },
      {
        $set: {
          [position]: positionData.position,
          [pinned]: positionData.pinned,
          [weight]: positionData.weight,
          [updatedAt]: new Date(),
          type: "simple" // for multi-schema
        }
      }
    );
  },

  /**
   * @name products/updateVariantsPosition
   * @memberof Methods/Products
   * @method
   * @description updates top level variant position index
   * @param {Array} sortedVariantIds - array of top level variant `_id`s
   * @since 0.11.0
   * @return {Number} Products.update result
   */
  "products/updateVariantsPosition"(sortedVariantIds) {
    check(sortedVariantIds, [String]);

    // This checks to make sure the user has createProduct permissions for the active shop.
    // TODO: We should determine if that is the correct role that a user should have
    // to be permitted to re-arrange products on the grid
    if (!Reaction.hasPermission("createProduct")) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    sortedVariantIds.forEach((id, index) => {
      updateCatalogProduct(
        this.userId,
        {
          _id: id
        },
        {
          $set: { index }
        },
        {
          selector: { type: "variant" }
        }
      );
      Logger.debug(`Variant ${id} position was updated to index ${index}`);
    });
  },

  /**
   * @name products/updateMetaFields
   * @memberof Methods/Products
   * @method
   * @summary update product metafield
   * @param {String} productId - productId
   * @param {Object} updatedMeta - update object with metadata
   * @param {Object|Number|undefined|null} meta - current meta object, or a number index
   * @todo should this method works for variants also?
   * @return {Number} collection update result
   */
  "products/updateMetaFields"(productId, updatedMeta, meta) {
    check(productId, String);
    check(updatedMeta, Object);
    check(meta, Match.OneOf(Object, Number, undefined, null));

    // Check first if Product exists and then if user has the proper rights
    const product = Products.findOne(productId);
    if (!product) {
      throw new Meteor.Error("not-found", "Product not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, product.shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    // update existing metadata
    if (typeof meta === "object") {
      return updateCatalogProduct(
        this.userId,
        {
          _id: productId,
          metafields: meta
        }, {
          $set: {
            "metafields.$": updatedMeta
          }
        }, {
          selector: { type: "simple", metafields: meta }
        }
      );
    } else if (typeof meta === "number") {
      return updateCatalogProduct(
        this.userId,
        {
          _id: productId
        },
        {
          $set: {
            [`metafields.${meta}`]: updatedMeta
          }
        },
        {
          selector: { type: "simple", metafields: meta }
        }
      );
    }

    // adds metadata
    return updateCatalogProduct(
      this.userId,
      {
        _id: productId
      },
      {
        $addToSet: {
          metafields: updatedMeta
        }
      },
      {
        selector: { type: "simple" }
      }
    );
  },

  /**
   * @name products/removeMetaFields
   * @memberof Methods/Products
   * @method
   * @summary update product metafield
   * @param {String} productId - productId
   * @param {Object} metafields - metadata object to remove
   * @param {Object} type - optional product type for schema selection
   * @return {Number} collection update result
   */
  "products/removeMetaFields"(productId, metafields, type = "simple") {
    check(productId, String);
    check(metafields, Object);
    check(type, String);

    // Check first if Product exists and then if user has the proper rights
    const product = Products.findOne(productId);
    if (!product) {
      throw new Meteor.Error("not-found", "Product not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, product.shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    return updateCatalogProduct(
      this.userId,
      {
        _id: productId,
        type
      },
      {
        $pull: { metafields }
      }
    );
  },

  /**
   * @name products/publishProduct
   * @memberof Methods/Products
   * @method
   * @summary publish (visibility) of product
   * @todo hook into publishing flow
   * @param {String} productId - productId
   * @return {Boolean} product.isVisible
   */
  "products/publishProduct"(productId) {
    check(productId, String);

    // Check first if Product exists and then if user has the proper rights
    const product = Products.findOne(productId);
    if (!product) {
      throw new Meteor.Error("not-found", "Product not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, product.shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    const variants = Products.find({
      ancestors: {
        $in: [productId]
      }
    }).fetch();
    let variantValidator = true;

    if (typeof product === "object" && product.title.length > 1) {
      if (variants.length > 0) {
        variants.forEach((variant) => {
          // if this is a top variant with children, we avoid it to check price
          // because we using price of its children
          if ((variant.ancestors.length === 1 && !Catalog.getVariants(variant._id, "variant").length) ||
            variant.ancestors.length !== 1) {
            if (!(typeof variant.price === "number" && variant.price > 0)) {
              variantValidator = false;
            }
          }
          // if variant has no title
          if (typeof variant.title === "string" && !variant.title.length) {
            variantValidator = false;
          }
          if (typeof variant.optionTitle === "string" && !variant.optionTitle.length) {
            variantValidator = false;
          }
        });
      } else {
        Logger.debug("invalid product visibility ", productId);
        throw new Meteor.Error("invalid-parameter", "Variant is required");
      }

      if (!variantValidator) {
        Logger.debug("invalid product visibility ", productId);
        throw new Meteor.Error(
          "invalid-parameter",
          "Some properties are missing."
        );
      }

      // update product visibility
      Logger.debug("toggle product visibility ", product._id, !product.isVisible);

      const res = updateCatalogProduct(
        this.userId,
        {
          _id: product._id
        },
        {
          $set: {
            isVisible: !product.isVisible
          }
        },
        {

          selector: { type: "simple" }
        }
      );

      // update product variants visibility
      updateVariantProductField(variants, "isVisible", !product.isVisible);
      // if collection updated we return new `isVisible` state
      return res === 1 && !product.isVisible;
    }
    Logger.debug("invalid product visibility ", productId);
    throw new Meteor.Error("invalid-parameter", "Bad Request");
  },

  /**
   * @name products/toggleVisibility
   * @memberof Methods/Products
   * @method
   * @summary publish (visibility) of product
   * @todo hook into publishing flow
   * @param {String} productId - productId
   * @return {Boolean} product.isVisible
   */
  "products/toggleVisibility"(productId) {
    check(productId, String);

    // Check first if Product exists and then if user has the proper rights
    const product = Products.findOne(productId);
    if (!product) {
      throw new Meteor.Error("not-found", "Product not found");
    }

    if (!Reaction.hasPermission("createProduct", this.userId, product.shopId)) {
      throw new Meteor.Error("access-denied", "Access Denied");
    }

    const res = updateCatalogProduct(
      this.userId,
      {
        _id: productId
      },
      {
        $set: {
          isVisible: !product.isVisible
        }
      },
      {
        selector: {
          type: product.type
        }
      }
    );

    if (Array.isArray(product.ancestors) && product.ancestors.length) {
      const updateId = product.ancestors[0] || product._id;
      const updatedPriceRange = ReactionProduct.getProductPriceRange(updateId);

      Meteor.call("products/updateProductField", updateId, "price", updatedPriceRange);
    }

    // if collection updated we return new `isVisible` state
    return res === 1 && !product.isVisible;
  }
});
