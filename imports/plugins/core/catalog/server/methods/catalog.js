import Logger from "@reactioncommerce/logger";
import { check, Match } from "meteor/check";
import { EJSON } from "meteor/ejson";
import { Meteor } from "meteor/meteor";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";
import { Products, Tags } from "/lib/collections";
import appEvents from "/imports/node-app/core/util/appEvents"; // TODO this can't rely on appEvents after API is split out
import rawCollections from "/imports/collections/rawCollections";
import hashProduct from "../utils/hashProduct";

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
 * @function createHandle
 * @private
 * @description Recursive method which trying to find a new `handle`, given the
 * existing copies
 * @param {String} productHandle - product `handle`
 * @param {String} productId - current product `_id`
 * @returns {String} handle - modified `handle`
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
 * @function
 * @name updateCatalogProduct
 * @summary Updates a product document.
 * @param {String} userId - currently logged in user
 * @param {Object} selector - selector for product to update
 * @param {Object} modifier - Object describing what parts of the document to update.
 * @param {Object} validation - simple schema validation options
 * @returns {String} _id of updated document
 */
function updateCatalogProduct(userId, selector, modifier, validation) {
  const product = Products.findOne(selector);

  const result = Products.update(selector, modifier, validation);

  hashProduct(product._id, rawCollections, false)
    .catch((error) => {
      Logger.error(`Error updating currentProductHash for product with ID ${product._id}`, error);
    });

  return result;
}

Meteor.methods({
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
   * @returns {Number} returns update result
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

    if (!Reaction.hasPermission(["createProduct", "product/admin", "product/update"], this.userId, doc.shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
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
    } else if (field === "title" && !doc.handle) {
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

    // If we get a result from the product update, emit update events
    if (result === 1) {
      if (type === "variant") {
        appEvents.emit("afterVariantUpdate", { _id, field, value });
      } else {
        appEvents.emit("afterProductUpdate", { _id, field, value });
      }
    }

    return update;
  },

  /**
   * @name products/updateProductTags
   * @memberof Methods/Products
   * @method
   * @summary method to insert or update tag with hierarchy
   * @param {String} productId - productId
   * @param {String} tagName - tagName
   * @param {String} tagId - tagId
   * @returns {Number} return result
   */
  "products/updateProductTags"(productId, tagName, tagId) {
    check(productId, String);
    check(tagName, String);
    check(tagId, Match.OneOf(String, null));

    // Check first if Product exists and then if user has the right to alter it
    const product = Products.findOne(productId);
    if (!product) {
      throw new ReactionError("not-found", "Product not found");
    }

    if (!Reaction.hasPermission(["createProduct", "product/admin", "product/update"], this.userId, product.shopId)) {
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
   * @returns {String} return update result
   */
  "products/removeProductTag"(productId, tagId) {
    check(productId, String);
    check(tagId, String);

    // Check first if Product exists and then if user has the right to alter it
    const product = Products.findOne(productId);
    if (!product) {
      throw new ReactionError("not-found", "Product not found");
    } else if (!Reaction.hasPermission(["createProduct", "product/admin", "product/update"], this.userId, product.shopId)) {
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
    } else if (!Reaction.hasPermission(["createProduct", "product/admin", "product/update"], this.userId, product.shopId)) {
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
   * @returns {String} return update result
   */
  "products/setHandleTag"(productId, tagId) {
    check(productId, String);
    check(tagId, String);
    // Check first if Product exists and then if user has the right to alter it
    const product = Products.findOne(productId);
    if (!product) {
      throw new ReactionError("not-found", "Product not found");
    } else if (!Reaction.hasPermission(["createProduct", "product/admin", "product/update"], this.userId, product.shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    // eslint-disable-next-line require-jsdoc
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
   * @returns {Number} Products.update result
   */
  "products/updateVariantsPosition"(sortedVariantIds, shopId) {
    check(sortedVariantIds, [String]);
    check(shopId, String);

    // This checks to make sure the user has createProduct permissions for the active shop.
    // TODO: We should determine if that is the correct role that a user should have
    // to be permitted to re-arrange products on the grid
    if (!Reaction.hasPermission(["createProduct", "product/admin", "product/update"], this.userId, shopId)) {
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
   * @returns {Number} collection update result
   */
  "products/updateMetaFields"(productId, updatedMeta, meta) {
    check(productId, String);
    check(updatedMeta, Object);
    check(meta, Match.OneOf(Object, Number, undefined, null));

    // Check first if Product exists and then if user has the proper rights
    const product = Products.findOne(productId);
    if (!product) {
      throw new ReactionError("not-found", "Product not found");
    } else if (!Reaction.hasPermission(["createProduct", "product/admin", "product/update"], this.userId, product.shopId)) {
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
   * @returns {Number} collection update result
   */
  "products/removeMetaFields"(productId, metafields, type = "simple") {
    check(productId, String);
    check(metafields, Object);
    check(type, String);

    // Check first if Product exists and then if user has the proper rights
    const product = Products.findOne(productId);
    if (!product) {
      throw new ReactionError("not-found", "Product not found");
    } else if (!Reaction.hasPermission(["createProduct", "product/admin", "product/update"], this.userId, product.shopId)) {
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
   * @name products/toggleVisibility
   * @memberof Methods/Products
   * @method
   * @summary publish (visibility) of product
   * @todo hook into publishing flow
   * @param {String} productId - productId
   * @returns {Boolean} product.isVisible
   */
  "products/toggleVisibility"(productId) {
    check(productId, String);

    // Check first if Product exists and then if user has the proper rights
    const product = Products.findOne({ _id: productId });
    if (!product) {
      throw new ReactionError("not-found", "Product not found");
    }

    if (!Reaction.hasPermission(["createProduct", "product/admin", "product/update"], this.userId, product.shopId)) {
      throw new ReactionError("access-denied", "Access Denied");
    }

    const newFieldValue = !product.isVisible;

    const res = updateCatalogProduct(
      this.userId,
      {
        _id: productId
      },
      {
        $set: {
          isVisible: newFieldValue
        }
      },
      {
        selector: {
          type: product.type
        }
      }
    );

    if (res === 1) {
      if (product.type === "variant") {
        appEvents.emit("afterVariantUpdate", {
          _id: productId,
          field: "isVisible",
          value: newFieldValue
        });
      } else {
        appEvents.emit("afterProductUpdate", {
          _id: productId,
          field: "isVisible",
          value: newFieldValue
        });
      }
    }

    // if collection updated we return new `isVisible` state
    return res === 1 && newFieldValue;
  }
});
