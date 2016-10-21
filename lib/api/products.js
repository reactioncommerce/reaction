import i18next from "i18next";
import { Meteor } from "meteor/meteor";
import { ReactiveDict } from "meteor/reactive-dict";
import { FlowRouter } from "meteor/kadira:flow-router-ssr";
import { getCurrentTag, getShopName } from "/lib/api";
import { Products } from "/lib/collections";
import Catalog from "./catalog";

// ReactionProduct is only intended to be used on the client, but it's placed
// in common code because of it is imported by the Products schema

/**
 *  currentProduct
 *  @summary Reactive current product dependency, ensuring reactive products, without session
 *  @todo this is a messy class implementation, normalize it.
 *  @description
 *  products:

 */
const ReactionProduct = new ReactiveDict("currentProduct");

export function applyProductRevision(product) {
  if (product) {
    if (product.__revisions && product.__revisions.length) {
      const cleanProduct = Object.assign({}, product);
      delete cleanProduct.__revisions;

      return Object.assign({},
        product.__revisions[0].documentData,
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
 * setCurrentVariant
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
 * ReactionProduct.setProduct
 * this will be deprecated in favor of template.instance data.
 *
 * @summary method to set default/parameterized product variant
 * @param {String} currentProductId - set current productId
 * @param {String} currentVariantId - set current variantId
 * @return {Object} product object
 */
ReactionProduct.setProduct = (currentProductId, currentVariantId) => {
  let productId = currentProductId || FlowRouter.getParam("handle");
  let variantId = currentVariantId || FlowRouter.getParam("variantId");
  let product;

  if (!productId.match(/^[23456789ABCDEFGHJKLMNPQRSTWXYZabcdefghijkmnopqrstuvwxyz]{17}$/)) {
    const handle = productId.toLowerCase();
    product = Products.findOne({ handle });
    productId = product && product._id;
  } else {
    product = Products.findOne({
      _id: productId
    });
  }
  if (product) {
    // set the default variant
    // as the default.
    if (!variantId) {
      const variants = ReactionProduct.getTopVariants(productId);
      variantId = Array.isArray(variants) && variants.length &&
        variants[0]._id || null;
    }
    // set in our reactive dictionary
    ReactionProduct.set("productId", productId);
    ReactionProduct.set("variantId", variantId);
  }

  return applyProductRevision(product);
};

/**
 * selectedProductId
 * @summary get the currently active/requested product
 * @return {String} currently selected product id
 */
ReactionProduct.selectedProductId = () => ReactionProduct.get("productId");

/**
 * selectedVariantId
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
 * selectedVariant
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
 * selectedProduct
 * @summary get the currently active/requested product object
 * @return {Object|undefined} currently selected product cursor
 */
ReactionProduct.selectedProduct = function () {
  const id = ReactionProduct.selectedProductId();
  if (typeof id === "string") {
    return applyProductRevision(Products.findOne(id));
  }
  return [];
};

/**
 * checkChildVariants
 * @summary return number of child variants for a parent
 * @param {String} parentVariantId - parentVariantId
 * @return {Number} count of childVariants for this parentVariantId
 */
ReactionProduct.checkChildVariants = function (parentVariantId) {
  const childVariants = ReactionProduct.getVariants(parentVariantId);
  return childVariants.length ? childVariants.length : 0;
};

/**
 * checkInventoryVariants
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
 * getVariantPriceRange
 * @summary get price range of a variant if it has child options.
 * if no child options, return main price value
 * @todo remove string return and replace with object
 * @param {String} [id] - current variant _Id
 * @return {String} formatted price or price range
 */
ReactionProduct.getVariantPriceRange = id => Catalog.
  getVariantPriceRange(id || ReactionProduct.selectedVariant()._id);

/**
 * getProductPriceRange
 * @summary get price range of a product
 * if no only one price available, return it
 * otherwise return a string range
 * @todo remove string return and replace with object
 * @param {String} [id] - current product _id
 * @return {String} formatted price or price range
 */
ReactionProduct.getProductPriceRange = id => Catalog.
  getProductPriceRange(id || ReactionProduct.selectedProductId());

/**
 * getVariantQuantity
 * @description middleware method which calls the same named common method.
 * @todo maybe we could remove this after 1.3. But for now I like how it looks.
 * @param {Object} doc - variant object
 * @return {Number} summary of options quantity or top-level variant
 * inventoryQuantity
 */
ReactionProduct.getVariantQuantity = doc => Catalog.getVariantQuantity(doc);

/**
 * @method getVariants
 * @description Get all parent variants
 * @summary could be useful for products and for top level variants
 * @param {String} [id] - product _id
 * @param {String} [type] - type of variant
 * @return {Array} Parent variants or empty array
 */
ReactionProduct.getVariants = (id, type) => {
  return Catalog.getVariants(id || ReactionProduct.selectedProductId(), type);
};

/**
 * @method getTopVariants
 * @description Get only product top level variants
 * @param {String} [id] - product _id
 * @return {Array} Product top level variants or empty array
 */
ReactionProduct.getTopVariants = id => {
  return Catalog.getTopVariants(id || ReactionProduct.selectedProductId());
};

/**
 * getTag
 * @summary This needed for naming `positions` object. Method could return `tag`
 * route name or shop name as default name.
 * @return {String} tag name or shop name
 */
ReactionProduct.getTag = () => {
  return getCurrentTag() || getShopName().toLowerCase();
};

/**
 * getProductsByTag
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
 * publishProduct
 * @summary product publishing and alert
 * @param {Object} productOrArray - product Object
 * @returns {undefined} - returns nothing, and alerts, happen here
 */
ReactionProduct.publishProduct = function (productOrArray) {
  const products = !_.isArray(productOrArray) ? [productOrArray] : productOrArray;
  /* eslint no-loop-func: 1 */
  //
  // TODO review process for publishing arrays of product
  //
  for (const product of products) {
    Meteor.call("products/publishProduct", product._id, (error, result) => {
      if (error) {
        Alerts.add(error, "danger", {
          placement: "productGridItem",
          id: product._id
        });
        throw new Meteor.Error("error publishing product", error);
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
 * publishProduct
 * @summary product publishing and alert
 * @param {Object} productOrArray - product Object
 * @returns {undefined} - returns nothing, and alerts, happen here
 */
ReactionProduct.toggleVisibility = function (productOrArray) {
  const products = !_.isArray(productOrArray) ? [productOrArray] : productOrArray;
  for (const product of products) {
    Meteor.call("products/toggleVisibility", product._id, (error, result) => {
      if (error) {
        Alerts.add(error, "danger", {
          placement: "productGridItem",
          id: product._id
        });
        throw new Meteor.Error("error publishing product", error);
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
 * cloneProduct
 * @summary product cloning and alert
 * @param {Object|Array} productOrArray - if this method calls from productGrid
 * it receives and array with product _id or _ids, but if it calls from PDP, when
 * it receive a `Object` with _id. It needed to determine the source of call.
 * @returns {undefined} - returns nothing, and alerts, happen here
 */
ReactionProduct.cloneProduct = function (productOrArray) {
  const products = !Array.isArray(productOrArray) ? [productOrArray] : productOrArray;

  return Meteor.call("products/cloneProduct", products, function (error, result) {
    if (error) {
      Alerts.add(error, "danger", { placement: "productGridItem" });
      throw new Meteor.Error("error cloning product", error);
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
        Alerts.add(i18next.t("productDetail.clonedAlert_plural", { product: i18next.t("productDetail.theSelectedProducts"), count: 0 }),
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
      FlowRouter.go("product", {
        handle: result[0]
      });
    }
  });
};

/**
 * maybeDeleteProduct
 * @summary confirm product deletion, delete, and alert
 * @param {Object} productOrArray - product Object
 * @returns {undefined} - returns nothing, and alerts, happen here
 */
ReactionProduct.maybeDeleteProduct = function (productOrArray) {
  const products = !_.isArray(productOrArray) ? [productOrArray] : productOrArray;
  const productIds = _.map(products, product => product._id);
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
      Meteor.call("products/deleteProduct", productIds, function (error, result) {
        let title;
        if (error) {
          title = products.length === 1 ?
            products[0].title || i18next.t("productDetail.deleteErrorTheProduct") :
            i18next.t("productDetail.theSelectedProducts");
          Alerts.toast(i18next.t("productDetail.productDeleteError", { product: title }), "error");
          throw new Meteor.Error("Error deleting " + title, error);
        }
        if (result) {
          FlowRouter.go("/");
          if (products.length === 1) {
            title = products[0].title || "productDetail.";
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


export default ReactionProduct;
