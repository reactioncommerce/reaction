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
      }
      const alertSettings = {
        placement: "productGridItem",
        id: product._id,
        autoHide: true,
        dismissable: false
      };
      if (result === true) {
        Alerts.add(product.title + " " + i18next.t("productDetail.publishProductVisible"), "success", alertSettings);
      } else {
        Alerts.add(product.title + " " + i18next.t("productDetail.publishProductHidden"), "warning", alertSettings);
      }
    });
  }
};

/**
 * cloneProduct
 * @summary product cloning and alert
 * @param {Object} productOrArray - product Object
 * @returns {undefined} - returns nothing, and alerts, happen here
 */
ReactionProduct.cloneProduct = function (productOrArray) {
  const products = !_.isArray(productOrArray) ? [productOrArray] : productOrArray;

  return Meteor.call("products/cloneProduct", products, function (error) {
    if (error) {
      throw new Meteor.Error("error cloning product", error);
    }
    for (let product of products) {
      Alerts.add(i18next.t("productDetail.clonedAlert") + " " + product.title, "success", {
        placement: "productGridItem",
        id: product._id,
        autoHide: true,
        dismissable: false
      });
    }
    if (!_.isArray(productOrArray)) {
      ReactionRouter.go("product", {
        handle: productOrArray._id
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
  let title;
  let confirmTitle;
  if (products.length === 1) {
    title = products[0].title || "the product";
    confirmTitle = "Delete this product?";
  } else {
    title = "the selected products";
    confirmTitle = "Delete selected products?";
  }

  if (confirm(confirmTitle)) {
    Meteor.call("products/deleteProduct", productIds, function (error, result) {
      if (error !== undefined || !result) {
        Alerts.toast(`There was an error deleting ${title}`, "error", {
          i18nKey: "productDetail.productDeleteError"
        });
        throw new Meteor.Error("Error deleting " + title, error);
      } else {
        ReactionRouter.go("/");
        Alerts.toast(i18next.t("productDetail.deletedAlert") + " " + title, "info");
      }
    });
  }
};
