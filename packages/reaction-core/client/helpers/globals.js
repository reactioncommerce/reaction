// Reaction Globals
//
// These should all be removed. PR's happily accepted.
//
/* eslint "no-extend-native": [2, {"exceptions": ["String"]}] */
/* eslint "no-alert": 0 */

/**
 * String.prototype.toCamelCase
 * @summary special toCamelCase for converting a string to camelCase for use with i18n keys
 * @return {String} camelCased string
 */
String.prototype.toCamelCase = function () {
  let s;
  s = this.replace(/([^a-zA-Z0-9_\- ])|^[_0-9]+/g, "").trim().toLowerCase();
  s = s.replace(/([ -]+)([a-zA-Z0-9])/g, function (a, b, c) {
    return c.toUpperCase();
  });
  s = s.replace(/([0-9]+)([a-zA-Z])/g, function (a, b, c) {
    return b + c.toUpperCase();
  });
  return s;
};

/**
 * toggleSession
 * quick and easy snippet for toggling sessions
 * @param {String} sessionVariable - string name, see http://docs.meteor.com/#/basic/session
 * @param {String} positiveState - optional, if is is positiveState, set opposite
 * @return {Object} return session value
 */
this.toggleSession = function (sessionVariable, positiveState) {
  let session;
  session = Session.get(sessionVariable);
  positive = positiveState || true;
  if (_.isEqual(positive, session)) {
    Session.set(sessionVariable, false);
  } else {
    Session.set(sessionVariable, positive);
  }
  return Session.get(sessionVariable);
};

/**
 * getProductsByTag
 * @summary method to return tag specific product
 * @param {String} tag - tag string
 * @return {Object} - return products collection cursor filtered by tag
 */
this.getProductsByTag = function (tag) {
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
publishProduct = function (productOrArray) {
  const products = !_.isArray(productOrArray) ? [productOrArray] : productOrArray;
  for (let product of products) {
    Meteor.call("products/publishProduct", product._id, function (error, result) {
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
        Alerts.add(product.title + " " + i18n.t("productDetail.publishProductVisible"), "success", alertSettings);
      } else {
        Alerts.add(product.title + " " + i18n.t("productDetail.publishProductHidden"), "warning", alertSettings);
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
cloneProduct = function (productOrArray) {
  const products = !_.isArray(productOrArray) ? [productOrArray] : productOrArray;

  return Meteor.call("products/cloneProduct", products, function (error) {
    if (error) {
      throw new Meteor.Error("error cloning product", error);
    }
    for (let product of products) {
      Alerts.add(i18n.t("productDetail.clonedAlert") + " " + product.title, "success", {
        placement: "productGridItem",
        id: product._id,
        autoHide: true,
        dismissable: false
      });
    }
    if (!_.isArray(productOrArray)) {
      Router.go("product", {
        _id: productOrArray._id
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
maybeDeleteProduct = function (productOrArray) {
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
      if (error || !result) {
        Alerts.add("There was an error deleting " + title, "danger", {
          i18nKey: "productDetail.productDeleteError"
        });
        throw new Meteor.Error("Error deleting " + title, error);
      } else {
        setCurrentProduct(null);
        Router.go("/");
        return Alerts.add(i18n.t("productDetail.deletedAlert") + " " + title, "info", {
          autoHide: true,
          dismissable: false
        });
      }
    });
  }
};

/**
>>>>>>> development
 * locateUser
 * @return {Object} set and return session address based on browser latitude, longitude
 */
this.locateUser = function () {
  function successFunction(position) {
    let lat = position.coords.latitude;
    let lng = position.coords.longitude;
    return Meteor.call("shop/locateAddress", lat, lng, function (error,
      address) {
      if (address) {
        return Session.set("address", address);
      }
    });
  }

  function errorFunction() {
    return Meteor.call("shop/locateAddress", function (error, address) {
      if (address) {
        return Session.set("address", address);
      }
    });
  }

  if (navigator.geolocation) {
    return navigator.geolocation.getCurrentPosition(successFunction,
      errorFunction);
  }
};

/**
 * getCardTypes
 * @summary determine the card type and return label
 * @todo needs i18n conversion?
 * @param {String} cardNumber - a credit card number
 * @return {String} card label, ie: visa
 */
this.getCardType = function (cardNumber) {
  let re = new RegExp("^4");
  if (cardNumber.match(re) !== null) {
    return "visa";
  }
  re = new RegExp("^(34|37)");
  if (cardNumber.match(re) !== null) {
    return "amex";
  }
  re = new RegExp("^5[1-5]");
  if (cardNumber.match(re) !== null) {
    return "mastercard";
  }
  re = new RegExp("^6011");
  if (cardNumber.match(re) !== null) {
    return "discover";
  }
  return "";
};

/**
 * getGuestLoginState
 * @summary determines if a guest checkout is enabled and the login state for users
 * @return {Boolean} true if authenticated user
 */
this.getGuestLoginState = function () {
  if (Meteor.user() && ReactionCore.getShopId() && ReactionCore.allowGuestCheckout()) {
    let isGuestFlow = Session.equals("guestCheckoutFlow", true);
    let isGuest = Roles.userIsInRole(Meteor.user(), "guest", ReactionCore.getShopId());
    let isAnonymous = Roles.userIsInRole(Meteor.user(), "anonymous", ReactionCore
      .getShopId());
    if (!isGuestFlow && !isGuest && isAnonymous) {
      return false;
    } else if (!isGuestFlow && isGuest && !isAnonymous) {
      return true;
    }
  } else if (Session.equals("guestCheckoutFlow", true) && _.pluck(Meteor.user()
      .emails, "address")) {
    return true;
  }
  return false;
};
