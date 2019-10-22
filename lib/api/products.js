import i18next from "i18next";
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { ReactiveDict } from "meteor/reactive-dict";
import { ReactiveVar } from "meteor/reactive-var";
import ReactionError from "@reactioncommerce/reaction-error";
import { Router } from "/imports/plugins/core/router/lib";
import { Products } from "/lib/collections";
import Catalog from "./catalog";
import { MetaData } from "/lib/api/router/metadata";

/**
 * @file ReactionProduct is only intended to be used on the client, but it's placed
 * in common code because it is imported by the Products schema.
 * ReactionProduct is a
 * {@link https://github.com/meteor/meteor/blob/master/packages/reactive-dict/README.md| ReactiveDict},
 * a general-purpose reactive datatype to use with
 * {@link https://github.com/meteor/meteor/tree/master/packages/tracker|Meteor Tracker}.
 * ReactionProduct allows the current product to be reactive, without Session.
 * @namespace ReactionProduct
 */

/**
 * @name ReactionProduct
 * @method
 * @memberof ReactionProduct
 * @summary Reactive current product dependency, ensuring reactive products, without session
 * ReactionProduct is a `ReactiveDict`, a general-purpose reactive datatype to use with Meteor Tracker.
 * @see {@link https://github.com/meteor/meteor/blob/master/packages/reactive-dict/README.md|Meteor ReactiveDict}
 * @see {@link https://github.com/meteor/meteor/tree/master/packages/tracker|Meteor Tracker}
 * @todo this is a messy class implementation, normalize it.
 */
const ReactionProduct = new ReactiveDict("currentProduct");

/**
 * @name variantIsSelected
 * @method
 * @memberof ReactionProduct
 * @param  {String} variantId ID of variant to check
 * @returns {Boolean}          True if variant is selected
 */
export function variantIsSelected(variantId) {
  const current = Object.assign({}, ReactionProduct.selectedVariant());
  if (current.ancestors && (variantId === current._id || current.ancestors.indexOf(variantId) >= 0)) {
    return true;
  }
  return false;
}

/**
 * @name setCurrentVariant
 * @method
 * @memberof ReactionProduct
 * @param {String} variantId - set current variantId
 * @returns {undefined}
 */
ReactionProduct.setCurrentVariant = (variantId) => {
  if (variantId === null) {
    ReactionProduct.set("variantId", null);
    ReactionProduct.set("variantId", ReactionProduct.selectedVariantId());
  }
  if (!variantId) {
    return;
  }
  const currentId = ReactionProduct.selectedVariantId();
  if (currentId === variantId) {
    return;
  }
  ReactionProduct.set("variantId", variantId);
};

/**
 * @name setProduct
 * @todo this will be deprecated in favor of template.instance data.
 * @method
 * @memberof ReactionProduct
 * @summary method to set default/parameterized product variant
 * @param {String} currentProductId - set current productId
 * @param {String} currentVariantId - set current variantId
 * @returns {Object} product object
 */
ReactionProduct.setProduct = (currentProductId, currentVariantId) => {
  let productId = currentProductId || Router.getParam("handle");
  let variantId = currentVariantId || Router.getParam("variantId");

  // Find the current product
  const product = Products.findOne({
    $or: [
      { handle: productId.toLowerCase() }, // Try the handle (slug) lowercased
      { handle: productId }, // Otherwise try the handle (slug) untouched
      { slug: productId.toLowerCase() }, // Try the slug lowercased
      { slug: productId }, // Otherwise try the slug untouched
      { _id: productId } // try the product id
    ]
  });

  productId = product && product._id;

  if (product) {
    // Check if selected variant id really belongs to the product.
    // This has been working previously rather accidentally, because variantIsSelected(variantId) below returned always false,
    // because the Product subscription ensured, that the correct Product is in Mini-Mongo. This is not guaranteed, though.
    // If Products collection would have other products, it would fail.
    let isVariantValidChild = true;
    const variants = Products.find({
      ancestors: { $in: [productId] }
    }).map((variant) => variant._id);
    if (variantId && !variants.includes(variantId)) {
      isVariantValidChild = false;
    }

    // set the default variant
    // as the default.
    if (!isVariantValidChild || !variantId || !variantIsSelected(variantId)) {
      const topVariants = ReactionProduct.getTopVariants(productId);
      variantId = (Array.isArray(topVariants) && topVariants.length && topVariants[0]._id) || null;
    }
    // set in our reactive dictionary
    ReactionProduct.set("productId", productId);
    ReactionProduct.set("variantId", variantId);
  }

  // Update the meta data when a product is selected
  MetaData.init(Router.current());

  return product;
};

/**
 * @name selectedProductId
 * @method
 * @memberof ReactionProduct
 * @summary get the currently active/requested product
 * @returns {String} currently selected product id
 */
ReactionProduct.selectedProductId = () => ReactionProduct.get("productId");

/**
 * @name selectedVariantId
 * @method
 * @memberof ReactionProduct
 * @summary get the currently active/requested variant
 * @returns {String} currently selected variant id
 */
ReactionProduct.selectedVariantId = () => {
  let id = ReactionProduct.get("variantId");
  if (id !== null) {
    return id;
  }
  const variants = ReactionProduct.getVariants();

  if (!(variants.length > 0)) {
    return [];
  }

  id = variants[0]._id;
  // ReactionProduct.set("variantId", id);
  return id;
};

/**
 * @name selectedVariant
 * @method
 * @memberof ReactionProduct
 * @summary get the currently active/requested variant object
 * @returns {Object} currently selected variant object
 */
ReactionProduct.selectedVariant = function () {
  const id = ReactionProduct.selectedVariantId();
  if (typeof id === "string") {
    return Products.findOne(id);
  }
  return [];
};

/**
 * @name selectedTopVariant
 * @method
 * @memberof ReactionProduct
 * @summary get the currently active TOP variant object
 * @returns {Object} currently selected TOP variant object
 */
ReactionProduct.selectedTopVariant = function () {
  const topVariants = ReactionProduct.getTopVariants();
  const topVariant = topVariants.find((variant) => variantIsSelected(variant._id));

  return topVariant;
};

/**
 * @name selectedProduct
 * @method
 * @memberof ReactionProduct
 * @summary get the currently active/requested product object
 * @returns {Object|undefined} currently selected product cursor
 */
ReactionProduct.selectedProduct = function () {
  const id = ReactionProduct.selectedProductId();
  if (typeof id === "string") {
    return Products.findOne(id);
  }
  return null;
};

/**
 * @name checkChildVariants
 * @method
 * @memberof ReactionProduct
 * @summary return number of child variants for a parent
 * @param {String} parentVariantId - parentVariantId
 * @returns {Number} count of childVariants for this parentVariantId
 */
ReactionProduct.checkChildVariants = function (parentVariantId) {
  const childVariants = ReactionProduct.getVariants(parentVariantId);
  return childVariants.length ? childVariants.length : 0;
};

/**
 * @name checkInventoryVariants
 * @method
 * @memberof ReactionProduct
 * @summary return number of inventory variants for a parent
 * @param {String} parentVariantId - parentVariantId
 * @todo could be combined with checkChildVariants in one method
 * @todo inventoryVariants are deprecated. remove this.
 * @returns {Number} count of inventory variants for this parentVariantId
 */
ReactionProduct.checkInventoryVariants = function (parentVariantId) {
  const inventoryVariants = ReactionProduct.getVariants(parentVariantId, "inventory");
  return inventoryVariants.length ? inventoryVariants.length : 0;
};

/**
 * @method getVariants
 * @method
 * @memberof ReactionProduct
 * @summary Get all parent variants. Could be useful for products and for top level variants
 * @param {String} [id] - product _id
 * @param {String} [type] - type of variant
 * @returns {Array} Parent variants or empty array
 */
ReactionProduct.getVariants = (id, type) => Catalog.getVariants(id || ReactionProduct.selectedProductId(), type);

/**
 * @method getSiblings
 * @method
 * @memberof ReactionProduct
 * @summary Get all sibling variants - variants with the same ancestor tree
 * could be useful for child variants relationships with top-level variants
 * @param {Object} [variant] - product / variant object
 * @param {String} [type] - type of variant
 * @param {Boolean} [includeSelf] - include current variant in results
 * @returns {Array} Sibling variants or empty array
 */
ReactionProduct.getSiblings = (variant, type) =>
  Products.find({ ancestors: variant.ancestors, type: type || "variant" }).fetch();

/**
 * @method getVariantParent
 * @memberof ReactionProduct
 * @summary Get direct parent variant - could be useful for lower level variants to get direct parents
 * @param {Object} [variant] - product / variant object
 * @returns {Array} Parent variant or empty
 */
ReactionProduct.getVariantParent = (variant) =>
  Products.findOne({ _id: { $in: variant.ancestors }, type: "variant" });

/**
 * @method getTopVariants
 * @memberof ReactionProduct
 * @summary Get only product top level variants
 * @param {String} [id] - product _id
 * @returns {Array} Product top level variants or empty array
 */
ReactionProduct.getTopVariants = (id) => Catalog.getTopVariants(id || ReactionProduct.selectedProductId());

/**
 * @name getProductsByTag
 * @method
 * @memberof ReactionProduct
 * @summary method to return tag specific product
 * @param {String} tag - tag string
 * @returns {Object} - return products collection cursor filtered by tag
 */
ReactionProduct.getProductsByTag = function (tag) {
  let hashtags;
  let newRelatedTags;
  let relatedTag;
  let relatedTags;
  const selector = {};

  if (tag) {
    hashtags = [];
    relatedTags = [tag];
    while (relatedTags.length) {
      newRelatedTags = [];
      for (relatedTag of relatedTags) {
        if (!hashtags.includes(relatedTag._id)) {
          hashtags.push(relatedTag._id);
        }
      }
      relatedTags = newRelatedTags;
    }
    selector.hashtags = {
      $in: hashtags
    };
  }
  const cursor = Products.find(selector);
  return cursor;
};

/**
 * @name toggleVisibility
 * @method
 * @memberof ReactionProduct
 * @summary product publishing and alert
 * @param {Object} productOrArray - product Object
 * @returns {undefined} - returns nothing, and alerts, happen here
 */
ReactionProduct.toggleVisibility = function (productOrArray) {
  const products = !_.isArray(productOrArray) ? [productOrArray] : productOrArray;
  for (const product of products) {
    Meteor.call("products/toggleVisibility", product._id, (error, result) => {
      // eslint-disable-line no-loop-func
      if (error) {
        Alerts.add(error, "danger", {
          placement: "productGridItem",
          id: product._id
        });
        throw new ReactionError("error-occurred", error);
      }
      const alertSettings = {
        placement: "productGridItem",
        id: product._id,
        autoHide: true,
        dismissable: false
      };
      if (result) {
        Alerts.add(
          i18next.t("productDetail.publishProductVisible", { product: product.title }),
          "success",
          alertSettings
        );
      } else {
        Alerts.add(
          i18next.t("productDetail.publishProductHidden", { product: product.title }),
          "warning",
          alertSettings
        );
      }
    });
  }
};

/**
 * A reactive data source that tells any dependents that they should resubscribe their
 * active publication.
 * @type {ReactiveVar}
 * @ignore
 */
export const resubscribeAfterCloning = new ReactiveVar(false);

/**
 * @name isAncestorDeleted
 * @method
 * @memberof ReactionProduct
 * @summary Verify there are no deleted ancestors
 * Variants cannot be restored if their parent product / variant is deleted
 * @param  {Object} product     product Object
 * @param  {Boolean} includeSelf include product
 * @returns {Boolean}             True or false
 */
ReactionProduct.isAncestorDeleted = function (product, includeSelf) {
  const productIds = [
    ...product.ancestors // Avoid mutations
  ];

  if (includeSelf) {
    productIds.push(product._id);
  }

  // Verify there are no deleted ancestors
  // Variants cannot be restored if their parent product / variant is deleted
  const archivedCount = Products.find({
    _id: { $in: productIds },
    isDeleted: true
  }).count();

  if (archivedCount > 0) {
    return true;
  }

  return false;
};

export default ReactionProduct;
