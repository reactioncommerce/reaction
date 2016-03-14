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
  let selector = {};

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
  let cursor = ReactionCore.Collections.Products.find(selector);
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
  for (let product of products) {
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
      ReactionRouter.go("product", {
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
    confirmTitle = i18next.t("productDetailEdit.deleteThisProduct");
  } else {
    confirmTitle = i18next.t("productDetailEdit.deleteSelectedProducts");
  }

  if (confirm(confirmTitle)) {
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
        ReactionRouter.go("/");
        if (products.length === 1) {
          title = products[0].title || "productDetail.";
          Alerts.toast(i18next.t("productDetail.deletedAlert", { product: title }), "info");
        } else {
          title = i18next.t("productDetail.theSelectedProducts");
          Alerts.toast(i18next.t("productDetail.deletedAlert_plural", { product: title, count: 0 }), "info");
        }
      }
    });
  }
};
