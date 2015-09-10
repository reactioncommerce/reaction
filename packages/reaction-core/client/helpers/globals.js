
/**
* Match.OptionalOrNull
*/
var currentProduct;
Match.OptionalOrNull = function(pattern) {
  return Match.OneOf(void 0, null, pattern);
};

/**
 * convert a string to camelCase for use with i18n keys
 */

String.prototype.toCamelCase = function() {
  var s;
  s = this.replace(/([^a-zA-Z0-9_\- ])|^[_0-9]+/g, "").trim().toLowerCase();
  s = s.replace(/([ -]+)([a-zA-Z0-9])/g, function(a, b, c) {
    return c.toUpperCase();
  });
  s = s.replace(/([0-9]+)([a-zA-Z])/g, function(a, b, c) {
    return b + c.toUpperCase();
  });
  return s;
};


/**
 * quick and easy snippet for toggling sessions
 * accepts string name, see http://docs.meteor.com/#/basic/session
 * optional pass positive param match
 */

this.toggleSession = function(sessionVariable, positive) {
  var session;
  check(sessionVariable, String);
  session = Session.get(sessionVariable);
  positive = positive || true;
  if (_.isEqual(positive, session)) {
    Session.set(sessionVariable, false);
  } else {
    Session.set(sessionVariable, positive);
  }
  return Session.get(sessionVariable);
};


/**
 * method to return tag specific product
 */

this.getProductsByTag = function(tag) {
  var  hashtags, newRelatedTags, relatedTag, relatedTags, selector, _i, _len;
  selector = {};
  if (tag) {
    hashtags = [];
    relatedTags = [tag];
    while (relatedTags.length) {
      newRelatedTags = [];
      for (_i = 0, _len = relatedTags.length; _i < _len; _i++) {
        relatedTag = relatedTags[_i];
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
  var cursor = Products.find(selector);
  return cursor;
};


/**
 * confirm product deletion, delete, and alert
 */

this.maybeDeleteProduct = function(prod) {
  var id, title;
  title = prod.title || "the product";
  id = prod._id;
  if (confirm("Delete this product?")) {
    return Meteor.call("deleteProduct", id, function(error, result) {
      if (error || !result) {
        Alerts.add("There was an error deleting " + title, "danger", {
          type: "prod-delete-" + id,
          i18n_key: "productDetail.productDeleteError"
        });
        throw new Meteor.Error("Error deleting product " + id, error);
      } else {
        setCurrentProduct(null);
        Router.go("/");
        return Alerts.add("Deleted " + title, "info", {
          type: "prod-delete-" + id
        });
      }
    });
  }
};

this.locateUser = function() {
  var errorFunction, successFunction;
  successFunction = function(position) {
    var lat, lng;
    lat = position.coords.latitude;
    lng = position.coords.longitude;
    return Meteor.call("locateAddress", lat, lng, function(error, address) {
      if (address) {
        return Session.set("address", address);
      }
    });
  };
  errorFunction = function() {
    return Meteor.call("locateAddress", function(error, address) {
      if (address) {
        return Session.set("address", address);
      }
    });
  };
  if (navigator.geolocation) {
    return navigator.geolocation.getCurrentPosition(successFunction, errorFunction);
  }
};


/**
 *  Reactive current product
 *  This ensures reactive products, without session
 *  products:
 *  set usage: currentProduct.set "productId",string
 *  get usage: currentProduct.get "productId"
 *  variants:
 *  set usage: currentProduct.set "variantId",string
 *  get usage: currentProduct.get "variantId"
 */

this.currentProduct = {
  keys: {},
  deps: {},
  equals: function(key) {
    return this.keys[key];
  },
  get: function(key) {
    this.ensureDeps(key);
    this.deps[key].depend();
    return this.keys[key];
  },
  set: function(key, value) {
    this.ensureDeps(key);
    this.keys[key] = value;
    return this.deps[key].changed();
  },
  changed: function(key) {
    this.ensureDeps(key);
    return this.deps[key].changed();
  },
  ensureDeps: function(key) {
    if (!this.deps[key]) {
      return this.deps[key] = new Tracker.Dependency();
    }
  }
};

currentProduct = this.currentProduct;

this.setCurrentVariant = function(variantId) {
  var currentId;
  if (variantId === null) {
    currentProduct.set("variantId", null);
    currentProduct.set("variantId", selectedVariantId());
  }
  if (!variantId) {
    return;
  }
  currentId = selectedVariantId();
  if (currentId === variantId) {
    return;
  }
  currentProduct.set("variantId", variantId);
};

this.setCurrentProduct = function(productId) {
  var currentId;
  if (productId === null) {
    currentProduct.set("productId", null);
  }
  if (!productId) {
    return;
  }
  currentId = selectedProductId();
  if (currentId === productId) {
    return;
  }
  currentProduct.set("productId", productId);
  currentProduct.set("variantId", null);
};

this.selectedVariant = function() {
  var id, product, variant;
  id = selectedVariantId();
  if (!id) {
    return;
  }
  product = selectedProduct();
  if (!product) {
    return;
  }
  variant = _.findWhere(product.variants, {
    _id: id
  });
  return variant;
};

this.selectedProduct = function() {
  var id;
  id = selectedProductId();
  return Products.findOne(id);
};

this.selectedProductId = function() {
  return currentProduct.get("productId");
};

this.selectedVariantId = function() {
  var id, product, variant, variants;
  id = currentProduct.get("variantId");
  if (id != null) {
    return id;
  }
  product = selectedProduct();
  if (!product) {
    return;
  }
  variants = (function() {
    var _i, _len, _ref, _results;
    _ref = product.variants;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      variant = _ref[_i];
      if (!variant.parentId) {
        _results.push(variant);
      }
    }
    return _results;
  })();
  if (!(variants.length > 0)) {
    return;
  }
  id = variants[0]._id;
  currentProduct.set("variantId", id);
  return id;
};


/**
 * return number of child variants for a parent
 */

this.checkChildVariants = function(parentVariantId) {
  var childVariants, product, variant;
  product = selectedProduct();
  if (!product) {
    return;
  }
  childVariants = (function() {
    var _i, _len, _ref, _results;
    _ref = product.variants;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      variant = _ref[_i];
      if ((variant != null ? variant.parentId : void 0) === parentVariantId && (variant != null ? variant.type : void 0) !== 'inventory') {
        _results.push(variant);
      }
    }
    return _results;
  })();
  return childVariants.length;
};


/**
 * return number of inventory variants for a parent
 */

this.checkInventoryVariants = function(parentVariantId) {
  var inventoryVariants, product, variant;
  product = selectedProduct();
  if (!product) {
    return;
  }
  inventoryVariants = (function() {
    var _i, _len, _ref, _results;
    _ref = product.variants;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      variant = _ref[_i];
      if ((variant != null ? variant.parentId : void 0) === parentVariantId && (variant != null ? variant.type : void 0) === 'inventory') {
        _results.push(variant);
      }
    }
    return _results;
  })();
  return inventoryVariants.length;
};


/**
 * get price range of a variant if it has child options.
 * if no child options, return main price value
 */

this.getVariantPriceRange = function(variantId, productId) {
  var child, children, priceMax, priceMin, product, thisVariant, variant, _i, _len;
  productId = productId || selectedProductId();
  variantId = variantId || selectedVariant()._id;
  product = Products.findOne(productId);
  if (!(variantId && productId && product)) {
    return;
  }
  variant = _.findWhere(product.variants, {
    _id: variantId
  });
  children = (function() {
    var _i, _len, _ref, _results;
    _ref = product.variants;
    _results = [];
    for (_i = 0, _len = _ref.length; _i < _len; _i++) {
      thisVariant = _ref[_i];
      if (thisVariant.parentId === variantId) {
        _results.push(thisVariant);
      }
    }
    return _results;
  })();
  if (children.length === 0) {
    if (variant != null ? variant.price : void 0) {
      return variant.price;
    } else {
      return;
    }
  }
  if (children.length === 1) {
    return children[0].price;
  }
  priceMin = Number.POSITIVE_INFINITY;
  priceMax = Number.NEGATIVE_INFINITY;
  for (_i = 0, _len = children.length; _i < _len; _i++) {
    child = children[_i];
    if (child.price < priceMin) {
      priceMin = child.price;
    }
    if (child.price > priceMax) {
      priceMax = child.price;
    }
  }
  if (priceMin === priceMax) {
    return priceMin;
  }
  return priceMin + ' - ' + priceMax;
};


/**
 * get price range of a product
 * if no only one price available, return it
 */

this.getProductPriceRange = function(productId) {
  var firstPrice, lastPrice, priceMax, priceMin, product, range, variant, variantPrices, variants, _i, _len, _ref;
  product = Products.findOne(productId || ((_ref = selectedProduct()) != null ? _ref._id : void 0));
  productId = product != null ? product._id : void 0;
  if (!productId) {
    return;
  }
  variants = (function() {
    var _i, _len, _ref1, _results;
    _ref1 = product.variants;
    _results = [];
    for (_i = 0, _len = _ref1.length; _i < _len; _i++) {
      variant = _ref1[_i];
      if (!variant.parentId) {
        _results.push(variant);
      }
    }
    return _results;
  })();
  if (variants.length > 0) {
    variantPrices = [];
    for (_i = 0, _len = variants.length; _i < _len; _i++) {
      variant = variants[_i];
      range = getVariantPriceRange(variant._id, productId);
      if (Match.test(range, String)) {
        firstPrice = parseFloat(range.substr(0, range.indexOf(" ")));
        lastPrice = parseFloat(range.substr(range.lastIndexOf(" ") + 1));
        variantPrices.push(firstPrice, lastPrice);
      } else {
        variantPrices.push(range);
      }
    }
    priceMin = _.min(variantPrices);
    priceMax = _.max(variantPrices);
    if (priceMin === priceMax) {
      return priceMin;
    }
    return priceMin + ' - ' + priceMax;
  }
};


/**
 * getCardTypes
 */

this.getCardType = function(number) {
  var re;
  re = new RegExp("^4");
  if (number.match(re) != null) {
    return "visa";
  }
  re = new RegExp("^(34|37)");
  if (number.match(re) != null) {
    return "amex";
  }
  re = new RegExp("^5[1-5]");
  if (number.match(re) != null) {
    return "mastercard";
  }
  re = new RegExp("^6011");
  if (number.match(re) != null) {
    return "discover";
  }
  return "";
};


/**
 * getGuestLoginState
 * return true if guest checkout
 * return userId if authenticated checkout
 */

this.getGuestLoginState = function() {
  var isAnonymous, isGuest, isGuestFlow;
  if (Meteor.user() && ReactionCore.getShopId() && ReactionCore.allowGuestCheckout()) {
    isGuestFlow = Session.equals("guestCheckoutFlow", true);
    isGuest = Roles.userIsInRole(Meteor.user(), 'guest', ReactionCore.getShopId());
    isAnonymous = Roles.userIsInRole(Meteor.user(), 'anonymous', ReactionCore.getShopId());
    if (!isGuestFlow && !isGuest && isAnonymous) {
      return false;
    } else if (!isGuestFlow && isGuest && !isAnonymous) {
      return true;
    }
  } else if (Session.equals("guestCheckoutFlow", true) && _.pluck(Meteor.user().emails, "address")) {
    return true;
  }
  return false;
};
