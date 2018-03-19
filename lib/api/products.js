import i18next from "i18next";
import orderBy from "lodash/orderBy";
import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { ReactiveDict } from "meteor/reactive-dict";
import { ReactiveVar } from "meteor/reactive-var";
import { Router } from "/imports/plugins/core/router/lib";
import { getCurrentTag, getShopName } from "/lib/api";
import { Products, Revisions } from "/lib/collections";
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
 * @name applyProductRevision
 * @method
 * @memberof ReactionProduct
 * @summary Apply revision to product
 * @example applyProductRevision(product)
 * @param  {Object} product product
 * @return {Object|null} product or null, if no product found
 */
export function applyProductRevision(product) {
  if (product) {
    if (product.__revisions && product.__revisions.length) {
      const cleanProduct = Object.assign({}, product);
      delete cleanProduct.__revisions;
      let revisedProduct;
      // check for product revisions and set that as the current product
      for (const revision of product.__revisions) {
        if (!revision.parentDocument) {
          revisedProduct = product.__revisions[0].documentData;
        }
      }

      // if there are no revision to product (image and/or tag only) just set the original product as the product
      if (!revisedProduct) {
        revisedProduct = cleanProduct;
      }

      return Object.assign(
        {},
        revisedProduct,
        {
          __published: cleanProduct,
          __draft: product.__revisions[0]
        }
      );
    }
    return product;
  }

  return null;
}

/**
 * @name variantIsSelected
 * @method
 * @memberof ReactionProduct
 * @param  {String} variantId ID of variant to check
 * @return {Boolean}          True if variant is selected
 */
export function variantIsSelected(variantId) {
  const current = Object.assign({}, ReactionProduct.selectedVariant());
  if (current.ancestors && (variantId === current._id || current.ancestors.indexOf(variantId) >= 0)) {
    return true;
  }
  return false;
}

/**
 * @name sortProducts
 * @method
 * @memberof ReactionProduct
 * @summary Sort products by tag, creation date by tag and creation date
 * @param  {Array} products Array of products
 * @param  {String} tag     Tag
 * @return {Array}         Array of products
 */
ReactionProduct.sortProducts = (products, tag) => {
  let sorted = [];

  sorted = orderBy(
    products,
    // Sort by postion for tag
    (product) => product.positions && product.positions[tag] && product.positions[tag].position,
    // Then by creation date for tag
    (product) => product.positions && product.positions[tag] && product.positions[tag].createdAt,
    // Finally sort by creation date
    "createdAt"
  );

  return sorted;
};

/**
 * @name setCurrentVariant
 * @method
 * @memberof ReactionProduct
 * @param {String} variantId - set current variantId
 * @return {undefined}
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
 * @return {Object} product object
 */
ReactionProduct.setProduct = (currentProductId, currentVariantId) => {
  let productId = currentProductId || Router.getParam("handle");
  let variantId = currentVariantId || Router.getParam("variantId");

  // Find the current product
  const product = Products.findOne({
    $or: [
      { handle: productId.toLowerCase() }, // Try the handle (slug) lowercased
      { handle: productId }, // Otherwise try the handle (slug) untouched
      { _id: productId }, // try the product id
      { changedHandleWas: productId } // Last attempt: the permalink may have changed.
    ]
  });

  productId = product && product._id;

  if (product) {
    if (Router.getParam("handle") !== product.handle && product.changedHandleWas && product.changedHandleWas !== product.handle) {
      const newUrl = Router.pathFor("product", {
        hash: {
          handle: product.handle
        }
      });
      Router.go(newUrl);
    }

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

  return applyProductRevision(product);
};

/**
 * @name selectedProductId
 * @method
 * @memberof ReactionProduct
 * @summary get the currently active/requested product
 * @return {String} currently selected product id
 */
ReactionProduct.selectedProductId = () => ReactionProduct.get("productId");

/**
 * @name selectedVariantId
 * @method
 * @memberof ReactionProduct
 * @summary get the currently active/requested variant
 * @return {String} currently selected variant id
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
 * @return {Object} currently selected variant object
 */
ReactionProduct.selectedVariant = function () {
  const id = ReactionProduct.selectedVariantId();
  if (typeof id === "string") {
    return applyProductRevision(Products.findOne(id));
  }
  return [];
};

/**
 * @name selectedTopVariant
 * @method
 * @memberof ReactionProduct
 * @summary get the currently active TOP variant object
 * @return {Object} currently selected TOP variant object
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
 * @return {Object|undefined} currently selected product cursor
 */
ReactionProduct.selectedProduct = function () {
  const id = ReactionProduct.selectedProductId();
  if (typeof id === "string") {
    return applyProductRevision(Products.findOne(id));
  }
  return undefined;
};

/**
 * @name checkChildVariants
 * @method
 * @memberof ReactionProduct
 * @summary return number of child variants for a parent
 * @param {String} parentVariantId - parentVariantId
 * @return {Number} count of childVariants for this parentVariantId
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
 * @return {Number} count of inventory variants for this parentVariantId
 */
ReactionProduct.checkInventoryVariants = function (parentVariantId) {
  const inventoryVariants = ReactionProduct.getVariants(parentVariantId, "inventory");
  return inventoryVariants.length ? inventoryVariants.length : 0;
};

/**
 * @name getVariantPriceRange
 * @method
 * @memberof ReactionProduct
 * @summary get price range of a variant if it has child options.
 * if no child options, return main price value
 * @todo remove string return and replace with object
 * @param {String} [id] - current variant _Id
 * @return {String} formatted price or price range
 */

ReactionProduct.getVariantPriceRange = (id) => Catalog
  .getVariantPriceRange(id || ReactionProduct.selectedVariant()._id);

/**
 * @name getProductPriceRange
 * @method
 * @memberof ReactionProduct
 * @summary get price range of a product
 * if no only one price available, return it
 * otherwise return a string range
 * @todo remove string return and replace with object
 * @param {String} [id] - current product _id
 * @return {String} formatted price or price range
 */

ReactionProduct.getProductPriceRange = (id) => Catalog
  .getProductPriceRange(id || ReactionProduct.selectedProductId());

/**
 * @name getVariantQuantity
 * @method
 * @memberof ReactionProduct
 * @summary middleware method which calls the same named common method.
 * @todo maybe we could remove this after 1.3. But for now I like how it looks.
 * @param {Object} doc - variant object
 * @return {Number} summary of options quantity or top-level variant
 * inventoryQuantity
 */
ReactionProduct.getVariantQuantity = (doc) => Catalog.getVariantQuantity(doc);

/**
 * @method getProduct
 * @method
 * @memberof ReactionProduct
 * @summary Get product object. Could be useful for products and for top level variants
 * @param {String} [id] - product _id
 * @return {Object} Product data
 */
ReactionProduct.getProduct = (id) => Catalog.getProduct(id);

/**
 * @method getVariants
 * @method
 * @memberof ReactionProduct
 * @summary Get all parent variants. Could be useful for products and for top level variants
 * @param {String} [id] - product _id
 * @param {String} [type] - type of variant
 * @return {Array} Parent variants or empty array
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
 * @return {Array} Sibling variants or empty array
 */
ReactionProduct.getSiblings = (variant, type) => Catalog.getSiblings(variant, type);

/**
 * @method getVariantParent
 * @method
 * @memberof ReactionProduct
 * @summary Get direct parent variant - could be useful for lower level variants to get direct parents
 * @param {Object} [variant] - product / variant object
 * @return {Array} Parent variant or empty
 */
ReactionProduct.getVariantParent = (variant) => Catalog.getVariantParent(variant);

/**
 * @method getTopVariants
 * @summary Get only product top level variants
 * @param {String} [id] - product _id
 * @return {Array} Product top level variants or empty array
 */
ReactionProduct.getTopVariants = (id) => Catalog.getTopVariants(id || ReactionProduct.selectedProductId());

/**
 * @name getTag
 * @method
 * @memberof ReactionProduct
 * @summary This needed for naming `positions` object. Method could return `tag`
 * route name or shop name as default name.
 * @return {String} tag name or shop name
 */
ReactionProduct.getTag = () => getCurrentTag() || getShopName().toLowerCase();

/**
 * @name getProductsByTag
 * @method
 * @memberof ReactionProduct
 * @summary method to return tag specific product
 * @param {String} tag - tag string
 * @return {Object} - return products collection cursor filtered by tag
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
        if (hashtags.indexOf(relatedTag._id) === -1) {
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
 * @name publishProduct
 * @method
 * @memberof ReactionProduct
 * @summary product publishing and alert
 * @todo review process for publishing arrays of product
 * @param {Object} productOrArray - product Object
 * @returns {undefined} - returns nothing, and alerts, happen here
 */
ReactionProduct.publishProduct = function (productOrArray) {
  const products = !_.isArray(productOrArray) ? [productOrArray] : productOrArray;
  /* eslint no-loop-func: 1 */
  for (const product of products) {
    Meteor.call("products/publishProduct", product._id, (error, result) => { // eslint-disable-line no-loop-func
      if (error) {
        Alerts.add(error, "danger", {
          placement: "productGridItem",
          id: product._id
        });
        throw new Meteor.Error("error-occurred", error);
      }
      const alertSettings = {
        placement: "productGridItem",
        id: product._id,
        autoHide: true,
        dismissable: false
      };
      if (result) {
        Alerts.add(i18next.t("productDetail.publishProductVisible", { product: product.title }), "success", alertSettings);
      } else {
        Alerts.add(i18next.t("productDetail.publishProductHidden", { product: product.title }), "warning", alertSettings);
      }
    });
  }
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
    Meteor.call("products/toggleVisibility", product._id, (error, result) => { // eslint-disable-line no-loop-func
      if (error) {
        Alerts.add(error, "danger", {
          placement: "productGridItem",
          id: product._id
        });
        throw new Meteor.Error("error-occurred", error);
      }
      const alertSettings = {
        placement: "productGridItem",
        id: product._id,
        autoHide: true,
        dismissable: false
      };
      if (result) {
        Alerts.add(i18next.t("productDetail.publishProductVisible", { product: product.title }), "success", alertSettings);
      } else {
        Alerts.add(i18next.t("productDetail.publishProductHidden", { product: product.title }), "warning", alertSettings);
      }
    });
  }
};

/**
 * A reactive data source that tells any dependents that they should resubscribe their
 * active publication.
 * @type {ReactiveVar}
 */
export const resubscribeAfterCloning = new ReactiveVar(false);


/**
 * @name cloneProduct
 * @method
 * @memberof ReactionProduct
 * @summary product cloning and alert
 * @param {Object|Array} productOrArray - if this method calls from productGrid
 * it receives and array with product _id or _ids, but if it calls from PDP, when
 * it receive a `Object` with _id. It needed to determine the source of call.
 * @returns {undefined} - returns nothing, and alerts, happen here
 */
ReactionProduct.cloneProduct = function (productOrArray) {
  const products = !Array.isArray(productOrArray) ? [productOrArray] : productOrArray;

  return Meteor.call("products/cloneProduct", products, (error, result) => {
    if (error) {
      Alerts.add(error, "danger", { placement: "productGridItem" });
      throw new Meteor.Error("error-occurred", error);
    }
    if (result) {
      if (products.length === 1) {
        Alerts.add(i18next.t("productDetail.clonedAlert", { product: products[0].title }), "success", {
          placement: "productGridItem",
          id: products[0]._id,
          autoHide: true,
          dismissable: false
        });
      } else {
        Alerts.add(
          i18next.t("productDetail.clonedAlert_plural", { product: i18next.t("productDetail.theSelectedProducts"), count: 0 }),
          "success", {
            placement: "productGridItem",
            id: products[0]._id,
            autoHide: true,
            dismissable: false
          }
        );
      }
    }
    // this statement allow us to redirect to a new clone PDP if clone action
    // was fired within PDP, not within productGrid.
    if (!Array.isArray(productOrArray)) {
      Router.go("product", {
        handle: result[0]
      });
    } else {
      resubscribeAfterCloning.set(true);
    }
  });
};

/**
 * @name archiveProduct
 * @method
 * @memberof ReactionProduct
 * @summary confirm to archive product
 * @param {Object} productOrArray - product Object
 * @returns {undefined} - returns nothing, and alerts, happen here
 */
ReactionProduct.archiveProduct = function (productOrArray) {
  const products = !Array.isArray(productOrArray) ? [productOrArray] : productOrArray;
  const productIds = products.map((product) => (typeof product === "string" ? product : product._id));
  let confirmTitle;
  // we have to use so difficult logic with `length` check because of some
  // languages, which have different phrase forms for each of cases.
  // we are using i18next `plural` functionality here.
  // @see: http://i18next.com/translate/pluralSimple
  if (products.length === 1) {
    confirmTitle = i18next.t("productDetailEdit.archiveThisProduct");
  } else {
    confirmTitle = i18next.t("productDetailEdit.archiveSelectedProducts");
  }

  Alerts.alert({
    title: confirmTitle,
    type: "warning",
    showCancelButton: true,
    confirmButtonText: "Archive"
  }, (isConfirm) => {
    if (isConfirm) {
      Meteor.call("products/archiveProduct", productIds, (error, result) => {
        let title;
        if (error) {
          title = products.length === 1 ?
            products[0].title || i18next.t("productDetail.archiveErrorTheProduct") :
            i18next.t("productDetail.theSelectedProducts");
          Alerts.toast(i18next.t("productDetail.productArchiveError", { product: title }), "error");
          throw new Meteor.Error(`error-occurred${title}`, error);
        }
        if (result) {
          Router.go("/");
          if (products.length === 1) {
            title = products[0].title || i18next.t("productDetail.theProduct");
            Alerts.toast(i18next.t("productDetail.archivedAlert", { product: title }), "info");
          } else {
            title = i18next.t("productDetail.theSelectedProducts");
            Alerts.toast(i18next.t("productDetail.archivedAlert_plural", { product: title, count: 0 }), "info");
          }
        }
      });
    }
  });
};

/**
 * @name isAncestorDeleted
 * @method
 * @memberof ReactionProduct
 * @summary Verify there are no deleted ancestors
 * Variants cannot be restored if their parent product / variant is deleted
 * @param  {Object} product     product Object
 * @param  {Boolean} includeSelf include product
 * @return {Boolean}             True or false
 */
ReactionProduct.isAncestorDeleted = function (product, includeSelf) {
  const productIds = [
    ...product.ancestors // Avoid mutations
  ];

  if (includeSelf) {
    productIds.push(product._id);
  }

  // Verify there are no deleted ancestors,
  // Variants cannot be restored if their parent product / variant is deleted
  const archivedCount = Revisions.find({
    "documentId": { $in: productIds },
    "documentData.isDeleted": true,
    "workflow.status": {
      $nin: [
        "revision/published"
      ]
    }
  }).count();

  if (archivedCount > 0) {
    return true;
  }

  return false;
};

export default ReactionProduct;
