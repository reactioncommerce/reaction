// Reaction Globals
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
 * maybeDeleteProduct
 * @summary confirm product deletion, delete, and alert
 * @todo - refactor this back into templates. this is bad.
 * @param {Object} product - product Object
 * @return {Object} - returns nothing, and alerts,happen here
 */
this.maybeDeleteProduct = function (product) {
  let productIds;
  let title;
  let confirmTitle = "Delete this product?";

  if (_.isArray(product)) {
    if (product.length === 1) {
      title = product[0].title || "the product";
      productIds = [product[0]._id];
    } else {
      title = "the selected products";
      confirmTitle = "Delete selected products?";

      productIds = _.map(product, (item) => {
        return item._id;
      });
    }
  } else {
    title = product.title || "the product";
    productIds = [product._id];
  }

  if (confirm(confirmTitle)) {
    return Meteor.call("products/deleteProduct", productIds, function (error, result) {
      let id = "product";
      if (error || !result) {
        Alerts.add("There was an error deleting " + title, "danger", {
          type: "prod-delete-" + id,
          i18nKey: "productDetail.productDeleteError"
        });
        throw new Meteor.Error("Error deleting product " + id, error);
      } else {
        setCurrentProduct(null);
        ReactionRouter.go("/");
        return Alerts.add("Deleted " + title, "info", {
          type: "prod-delete-" + id
        });
      }
    });
  }
};

/**
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
