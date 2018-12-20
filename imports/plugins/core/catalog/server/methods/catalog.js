import _ from "lodash";
import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import { check, Match } from "meteor/check";
import { EJSON } from "meteor/ejson";
import { Meteor } from "meteor/meteor";
import { ReactionProduct } from "/lib/api";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";
import { MediaRecords, Products, Tags } from "/lib/collections";
import { Media } from "/imports/plugins/core/files/server";
import rawCollections from "/imports/collections/rawCollections";
import updateCatalogProductInventoryStatus from "/imports/plugins/core/catalog/server/no-meteor/utils/updateCatalogProductInventoryStatus";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import getVariantInventoryNotAvailableToSellQuantity from "/imports/plugins/core/inventory/server/no-meteor/utils/getVariantInventoryNotAvailableToSellQuantity";
import updateParentVariantsInventoryAvailableToSellQuantity from "/imports/plugins/core/inventory/server/no-meteor/utils/updateParentVariantsInventoryAvailableToSellQuantity";
import updateParentVariantsInventoryInStockQuantity from "/imports/plugins/core/inventory/server/no-meteor/utils/updateParentVariantsInventoryInStockQuantity";
import hashProduct from "../no-meteor/mutations/hashProduct";
import getCurrentCatalogPriceForProductConfiguration from "../no-meteor/queries/getCurrentCatalogPriceForProductConfiguration";
import getProductPriceRange from "../no-meteor/utils/getProductPriceRange";
import getVariants from "../no-meteor/utils/getVariants";
import hasChildVariant from "../no-meteor/utils/hasChildVariant";
import isSoldOut from "/imports/plugins/core/inventory/server/no-meteor/utils/isSoldOut";
import isLowQuantity from "/imports/plugins/core/inventory/server/no-meteor/utils/isLowQuantity";
import isBackorder from "/imports/plugins/core/inventory/server/no-meteor/utils/isBackorder";

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
    titleString = title.replace(/\d+$/, "").replace(/-$/, "");
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
  if (
    Products.find({
      title
    }).count() !== 0
  ) {
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
    handleString = handle.replace(/\d+$/, "").replace(/-$/, "");
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
      handle = `${handleString}-copy${handleCount > 1 ? `-${handleCount}` : ""}`;
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
      // Copy File and insert
      const promises = fileRecords.map((fileRecord) =>
        fileRecord.fullClone({
          productId: newId,
          variantId: variantNewId
        }));
      return Promise.all(promises);
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
    variants = Promise.await(getVariants(id, rawCollections, true));
  } else if (doc.type === "variant" && doc.ancestors.length === 1) {
    variants = Promise.await(getVariants(id, rawCollections));
  }
  const update = {};

  switch (field) {
    case "inventoryPolicy":
    case "inventoryQuantity":
    case "inventoryManagement":
      Object.assign(update, {
        isSoldOut: Promise.await(isSoldOut(variants, rawCollections)),
        isLowQuantity: Promise.await(isLowQuantity(variants, rawCollections)),
        isBackorder: Promise.await(isBackorder(variants, rawCollections))
      });
      break;
    case "lowInventoryWarningThreshold":
      Object.assign(update, {
        isLowQuantity: Promise.await(isLowQuantity(variants, rawCollections))
      });
      break;
    default: {
      // "price" is object with range, min, max
      const priceObject = Promise.await(getProductPriceRange(id, rawCollections));
      Object.assign(update, {
        price: priceObject
      });
    }
  }

  Products.update(
    id,
    {
      $set: update
    },
    {
      selector: {
        type: "simple"
      }
    }
  );
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

  const productUpdate = Products.update(
    {
      _id: id
    },
    {
      $set: {
        inventoryQuantity: 0
      }
    },
    {
      selector: {
        type: "variant"
      }
    }
  );

  return productUpdate;
}

/**
 * @function createProduct
 * @private
 * @description creates a product
 * @param {Object} props - initial product properties
 * @return {Object} product - new product
 */
function createProduct(props = null, info = {}) {
  const newProductOrVariant = {
    shopId: Reaction.getShopId(),
    type: "simple",
    ...(props || {})
  };

  if (newProductOrVariant.type === "variant") {
    const userId = Reaction.getUserId();
    const context = Promise.await(getGraphQLContextInMeteorMethod(userId));

    // Apply custom transformations from plugins.
    for (const customFunc of context.getFunctionsOfType("mutateNewVariantBeforeCreate")) {
      // Functions of type "mutateNewVariantBeforeCreate" are expected to mutate the provided variant.
      Promise.await(customFunc(newProductOrVariant, { context, ...info }));
    }
  } else {
    // Set handle for products only, not variants
    if (!newProductOrVariant.handle) {
      if (typeof newProductOrVariant.title === "string" && newProductOrVariant.title.length) {
        newProductOrVariant.handle = Reaction.getSlug(newProductOrVariant.title);
      } else {
        newProductOrVariant.handle = Random.id();
      }
    }

    // Price is required on products
    if (!newProductOrVariant.price) {
      newProductOrVariant.price = {
        range: "0.00 - 0.00",
        min: 0,
        max: 0
      };
    }
  }

  const _id = Products.insert(newProductOrVariant);

  return Products.findOne({ _id });
}

/**
 * @function
 * @name updateCatalogProduct
 * @summary Updates a product document.
 * @param {String} userId - currently logged in user
 * @param {Object} selector - selector for product to update
 * @param {Object} modifier - Object describing what parts of the document to update.
 * @param {Object} validation - simple schema validation options
 * @return {String} _id of updated document
 */
function updateCatalogProduct(userId, selector, modifier, validation) {
  const product = Products.findOne(selector);

  Hooks.Events.run("beforeUpdateCatalogProduct", product, {
    userId,
    modifier,
    validation
  });

  const result = Products.update(selector, modifier, validation);

  hashProduct(product._id, rawCollections, false)
    .catch((error) => {
      Logger.error(`Error updating currentProductHash for product with ID ${product._id}`, error);
    });

  if (product.ancestors && product.ancestors[0]) {
    // If update is variant, recalculate top-level product's price range
    const topLevelProductId = product.ancestors[0];
    const price = Promise.await(getProductPriceRange(topLevelProductId, rawCollections));
    Products.update({ _id: topLevelProductId }, { $set: { price } }, { selector: { type: 'simple' } });
  }

  Hooks.Events.run("afterUpdateCatalogProduct", product._id, { modifier });

  return result;
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
      throw new ReactionError("not-found", "Variant not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, variant.shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    // Verify that this variant and any ancestors are not deleted.
    // Child variants cannot be added if a parent product is marked as `{ isDeleted: true }`
    if (ReactionProduct.isAncestorDeleted(variant, true)) {
      throw new ReactionError("server-error", "Unable to create product variant");
    }

    const variants = Products.find({
      $or: [
        {
          _id: variantId
        },
        {
          ancestors: {
            $in: [variantId]
          },
          isDeleted: false
        }
      ],
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
          price: `${sortedVariant.price}` ? `${sortedVariant.price}` : `${variant.price}`,
          compareAtPrice: `${sortedVariant.compareAtPrice}`
            ? `${sortedVariant.compareAtPrice}`
            : `${variant.compareAtPrice}`
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
          price: `${sortedVariant.price}` ? `${sortedVariant.price}` : `${variant.price}`,
          compareAtPrice: `${sortedVariant.compareAtPrice}`
            ? `${sortedVariant.compareAtPrice}`
            : `${variant.compareAtPrice}`,
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
        newId = Products.insert(clone, { validate: false });
        Logger.debug(`products/cloneVariant: created ${type === "child" ? "sub child " : ""}clone: ${clone._id} from ${variantId}`);
      } catch (error) {
        Logger.error(`products/cloneVariant: cloning of ${variantId} was failed: ${error}`);
        throw error;
      }

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
   * @return {String} new variantId
   */
  "products/createVariant"(parentId) {
    check(parentId, String);

    // Check first if Product exists and then if user has the rights
    const parent = Products.findOne({ _id: parentId });
    if (!parent) {
      throw new ReactionError("not-found", "Parent not found");
    }

    let product;
    let parentVariant;
    if (parent.type === "variant") {
      product = Products.findOne({ _id: parent.ancestors[0] });
      parentVariant = parent;
    } else {
      product = parent;
      parentVariant = null;
    }

    const userId = Reaction.getUserId();
    if (!Reaction.hasPermission("createProduct", userId, product.shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    // Verify that the parent variant and any ancestors are not deleted.
    // Child variants cannot be added if a parent product is marked as `{ isDeleted: true }`
    if (ReactionProduct.isAncestorDeleted(product, true)) {
      throw new ReactionError("server-error", "Unable to create product variant");
    }

    // get parent ancestors to build new ancestors array
    const { ancestors } = parent;
    Array.isArray(ancestors) && ancestors.push(parentId);

    const newVariantId = Random.id();
    const newVariant = {
      _id: newVariantId,
      ancestors,
      shopId: product.shopId,
      type: "variant"
    };

    const isOption = ancestors.length > 1;
    if (isOption) {
      Object.assign(newVariant, {
        title: `${parent.title} - Untitled option`,
        price: 0.0
      });
    }

    // if we are inserting child variant to top-level variant, we need to remove
    // all top-level's variant inventory records and flush it's quantity,
    // because it will be hold sum of all it descendants quantities.
    if (ancestors.length === 2) {
      flushQuantity(parentId);
    }

    createProduct(newVariant, { product, parentVariant, isOption });

    Logger.debug(`products/createVariant: created variant: ${newVariantId} for ${parentId}`);

    return newVariantId;
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
      throw new ReactionError("not-found", "Variant not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, variant.shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    const selector = {
      // Don't "archive" variants that are already marked deleted.
      isDeleted: {
        $ne: true
      },
      $or: [
        {
          _id: variantId
        },
        {
          ancestors: {
            $in: [variantId]
          }
        }
      ]
    };
    const toDelete = Products.find(selector).fetch();

    // out if nothing to delete
    if (!Array.isArray(toDelete) || toDelete.length === 0) return false;

    // Flag the variant and all its children as deleted.
    toDelete.forEach((product) => {
      Hooks.Events.run("beforeRemoveCatalogProduct", product, { userId: this.userId });
      Products.update(
        {
          _id: product._id,
          type: product.type
        },
        {
          $set: {
            isDeleted: true
          }
        }
      );
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
      throw new ReactionError("access-denied", "Access Denied");
    }

    if (Array.isArray(productOrArray)) {
      // Reduce to unique shops found among products in this array
      const shopIds = productOrArray.map((prod) => prod.shopId);
      const uniqueShopIds = [...new Set(shopIds)];

      // For each unique shopId check to make sure that user has permission to clone
      uniqueShopIds.forEach((shopId) => {
        if (!Reaction.hasPermission("createProduct", this.userId, shopId)) {
          throw new ReactionError("access-denied", "Access Denied");
        }
      });
    } else if (!Reaction.hasPermission("createProduct", this.userId, productOrArray.shopId)) {
      // Single product was passed in - ensure that user has permission to clone
      throw new ReactionError("access-denied", "Access Denied");
    }

    let result;
    let products;
    const results = [];
    const pool = []; // pool of id pairs: { oldId, newId }

    function getIds(id) {
      return pool.filter(
        function (pair) {
          return pair.oldId === this.id;
        },
        {
          id
        }
      );
    }

    function setId(ids) {
      return pool.push(ids);
    }

    function buildAncestors(ancestors) {
      const newAncestors = [];
      ancestors.map((oldId) => {
        const pair = getIds(oldId);
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
        newProduct.handle = createHandle(Reaction.getSlug(newProduct.title), newProduct._id);
      }
      result = Products.insert(newProduct, { validate: false });
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

        result = Products.insert(newVariant, { validate: false });
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
   * @return {String} The new product ID
   */
  "products/createProduct"() {
    // Ensure user has createProduct permission for active shop
    if (!Reaction.hasPermission("createProduct")) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    // Create a product
    const newSimpleProduct = createProduct();

    // Create a product variant
    createProduct({
      ancestors: [newSimpleProduct._id],
      price: 0.0,
      title: "",
      type: "variant" // needed for multi-schema
    }, { product: newSimpleProduct, parentVariant: null, isOption: false });

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
      throw new ReactionError("not-found", "Product not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, product.shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
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
        $ne: true
      },
      $or: [
        {
          _id: {
            $in: productIds
          }
        },
        {
          ancestors: {
            $in: productIds
          }
        }
      ]
    }).fetch();

    const ids = [];
    productsWithVariants.map((doc) => {
      ids.push(doc._id);
      return ids;
    });

    // Flag the product and all of it's variants as deleted.
    productsWithVariants.forEach((toArchiveProduct) => {
      Hooks.Events.run("beforeRemoveCatalogProduct", toArchiveProduct, { userId: this.userId });
      Products.update(
        {
          _id: toArchiveProduct._id,
          type: toArchiveProduct.type
        },
        {
          $set: {
            isDeleted: true
          }
        }
      );
      Hooks.Events.run("afterRemoveCatalogProduct", this.userId, toArchiveProduct);
    });

    const numFlaggedAsDeleted = Products.find({
      _id: {
        $in: ids
      },
      isDeleted: true
    }).count();

    if (numFlaggedAsDeleted > 0) {
      // Flag associated MediaRecords as deleted.
      MediaRecords.update(
        {
          "metadata.productId": {
            $in: ids
          },
          "metadata.variantId": {
            $in: ids
          }
        },
        {
          $set: {
            "metadata.isDeleted": true
          }
        }
      );
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

    // Check first if Product exists and then if user has the right to alter it
    const doc = Products.findOne({ _id });
    if (!doc) {
      throw new ReactionError("not-found", "Product not found");
    }

    if (!Reaction.hasPermission("createProduct", this.userId, doc.shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    if (field === "inventoryQuantity" && value === "") {
      if (!Promise.await(hasChildVariant(_id, rawCollections))) {
        throw new ReactionError("invalid", "Inventory Quantity is required when no child variants");
      }
    }

    const { type } = doc;
    let update;
    // handle booleans with correct typing
    if (value === "false" || value === "true") {
      const booleanValue = value === "true" || value === true;
      update = EJSON.parse(`{"${field}":${booleanValue}}`);
    } else if (field === "handle") {
      update = {
        // TODO: write function to ensure new handle is unique.
        // Should be a call similar to the line below.
        [field]: createHandle(Reaction.getSlug(value), _id) // handle should be unique
      };
    } else if (field === "title" && doc.handle === doc._id) {
      // update handle once title is set
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
    } catch (err) {
      throw new ReactionError("server-error", err.message);
    }

    // If we get a result from the product update,
    // denormalize and attach results to top-level product
    if (result === 1) {
      if (type === "variant" && toDenormalize.indexOf(field) >= 0) {
        denormalize(doc.ancestors[0], field);
      }
    }
    return update;
  },

  /**
   * @name products/updateVariantAndProductInventory
   * @memberof Methods/Products
   * @method
   * @summary update inventory available to see of a variant / option and it's parents
   * @param {String} _id - variant or option ID of product that was updated
   * @return {Number} returns update result
   */
  "products/updateVariantAndProductInventory"(_id) {
    check(_id, String);

    // Check first if Product exists and then if user has the right to alter it
    const doc = Products.findOne({ _id });
    if (!doc) {
      throw new ReactionError("not-found", "Product not found");
    }

    if (!Reaction.hasPermission("createProduct", this.userId, doc.shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    // Get reserved inventory - the inventory currently in an unprocessed order
    const reservedInventory = Promise.await(getVariantInventoryNotAvailableToSellQuantity(doc, rawCollections));

    // Compute `inventoryAvailableToSell` as the inventory in stock minus the reserved inventory
    const computedInventoryAvailableToSell = doc.inventoryQuantity - reservedInventory;

    // we need to use sync mode here, to return correct error and result to UI
    let result; // eslint-disable-line
    try {
      result = updateCatalogProduct(
        this.userId,
        {
          _id
        },
        {
          $set: {
            inventoryAvailableToSell: computedInventoryAvailableToSell
          }
        },
        {
          selector: { type: "variant" }
        }
      );
    } catch (err) {
      throw new ReactionError("server-error", err.message);
    }

    // Update `inventoryAvailableToSell` on all parents of this variant / option
    Promise.await(updateParentVariantsInventoryAvailableToSellQuantity(doc, rawCollections));
    // Update `inventoryQuantity` on all parents of this variant / option
    Promise.await(updateParentVariantsInventoryInStockQuantity(doc, rawCollections));

    // Publish inventory to catalog
    Promise.await(updateCatalogProductInventoryStatus(doc.ancestors[0], rawCollections));

    // Return updated number for UI
    return computedInventoryAvailableToSell;
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
      throw new ReactionError("not-found", "Product not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, product.shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
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
        hashtags: existingTag._id
      }).count();
      if (productCount > 0) {
        throw new ReactionError("server-error", "Existing Tag, Update Denied");
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
      throw new ReactionError("not-found", "Product not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, product.shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
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
      throw new ReactionError("not-found", "Product not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, product.shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
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
      }
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
      throw new ReactionError("not-found", "Product not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, product.shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
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
      const currentProductHandle = createHandle(Reaction.getSlug(currentProduct.title), currentProduct._id);
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
   * @name products/updateVariantsPosition
   * @memberof Methods/Products
   * @method
   * @description updates top level variant position index
   * @param {Array} sortedVariantIds - array of top level variant `_id`s
   * @param {String} shopId - The ID of the shop that owns all variants being sorted
   * @since 0.11.0
   * @return {Number} Products.update result
   */
  "products/updateVariantsPosition"(sortedVariantIds, shopId) {
    check(sortedVariantIds, [String]);
    check(shopId, String);

    // This checks to make sure the user has createProduct permissions for the active shop.
    // TODO: We should determine if that is the correct role that a user should have
    // to be permitted to re-arrange products on the grid
    if (!Reaction.hasPermission("createProduct", this.userId, shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    sortedVariantIds.forEach((id, index) => {
      updateCatalogProduct(
        this.userId,
        {
          _id: id,
          // Query on shop ID to be sure a different ID was not passed in to pass the permission check
          shopId,
          type: "variant"
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
      throw new ReactionError("not-found", "Product not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, product.shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    // update existing metadata
    if (typeof meta === "object") {
      return updateCatalogProduct(
        this.userId,
        {
          _id: productId,
          metafields: meta
        },
        {
          $set: {
            "metafields.$": updatedMeta
          }
        },
        {
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
      throw new ReactionError("not-found", "Product not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, product.shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
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
      throw new ReactionError("not-found", "Product not found");
    } else if (!Reaction.hasPermission("createProduct", this.userId, product.shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    const variants = Products.find({
      ancestors: {
        $in: [productId]
      }
    }).fetch();
    let variantValidator = true;

    if (typeof product === "object" && product.title && product.title.length > 1) {
      if (variants.length > 0) {
        variants.forEach((variant) => {
          // if this is a top variant with children, we avoid it to check price
          // because we using price of its children
          const options = Promise.await(getVariants(variant._id, rawCollections));
          if ((variant.ancestors.length === 1 && !options.length) || variant.ancestors.length !== 1) {
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
        throw new ReactionError("invalid-parameter", "Variant is required");
      }

      if (!variantValidator) {
        Logger.debug("invalid product visibility ", productId);
        throw new ReactionError("invalid-parameter", "Some properties are missing.");
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
    throw new ReactionError("invalid-parameter", "Bad Request");
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
      throw new ReactionError("not-found", "Product not found");
    }

    if (!Reaction.hasPermission("createProduct", this.userId, product.shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
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
      const updatedPriceRange = Promise.await(getProductPriceRange(updateId, rawCollections));

      Meteor.call("products/updateProductField", updateId, "price", updatedPriceRange);
    }

    // if collection updated we return new `isVisible` state
    return res === 1 && !product.isVisible;
  },

  /**
   * @name catalog/getCurrentCatalogPriceForProductConfigurations
   * @memberof Methods/Catalog
   * @method
   * @summary Gets the current price for multiple product configurations. Newer code that uses
   *   GraphQL should not need this, but this is available while transitioning to GraphQL.
   * @param {Object[]} productConfigurations - Product configuration objects, with `productId` and `productVariantId`
   * @param {String} currencyCode Currency in which price is needed
   * @return {Object[]} The same array of objects that was passed in, but with `price` added to each object.
   */
  "catalog/getCurrentCatalogPriceForProductConfigurations"(productConfigurations, currencyCode) {
    check(productConfigurations, Array);
    check(currencyCode, String);
    return Promise.all(productConfigurations.map(async (productConfiguration) => {
      const { price } = await getCurrentCatalogPriceForProductConfiguration(productConfiguration, currencyCode, rawCollections);
      return { ...productConfiguration, price };
    }));
  }
});
