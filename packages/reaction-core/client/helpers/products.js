/**
 *  currentProduct
 *  @summary Reactive current product dependency, ensuring reactive products, without session
 *  @todo rename as this can easily be confused with ReactionCore.setCurrentProduct
 *  @todo this is a messy class implementation, normalize it.
 *  @description
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
  equals: function (key) {
    return this.keys[key];
  },
  get: function (key) {
    this.ensureDeps(key);
    this.deps[key].depend();
    return this.keys[key];
  },
  set: function (key, value) {
    this.ensureDeps(key);
    this.keys[key] = value;
    return this.deps[key].changed();
  },
  changed: function (key) {
    this.ensureDeps(key);
    return this.deps[key].changed();
  },
  ensureDeps: function (key) {
    if (!this.deps[key]) {
      this.deps[key] = new Tracker.Dependency();
      return this.deps[key];
    }
  }
};

// export currentProduct
currentProduct = this.currentProduct;

/**
 * setCurrentVariant
 * @param {String} variantId - set current variantId
 * @return {undefined}
 */
this.setCurrentVariant = function (variantId) {
  let currentId;
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

/**
 * setCurrentProduct
 * @param {String} productId - set current productId
 * @return {undefined}
 */
this.setCurrentProduct = function (productId) {
  let currentId;
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

/**
 * selectedVariant
 * @summary get the currently active/requested variant object
 * @return {Object} currently selected variant object
 */
this.selectedVariant = function () {
  const id = selectedVariantId();
  if (typeof id === "string") {
    return ReactionCore.Collections.Products.findOne(id);
  }
};

/**
 * selectedProduct
 * @summary get the currently active/requested product object
 * @return {Object|undefined} currently selected product cursor
 */
this.selectedProduct = function () {
  const id = selectedProductId();
  if (typeof id === "string") {
    return ReactionCore.Collections.Products.findOne(id);
  }
};

/**
 * selectedProductId
 * @summary get the currently active/requested product
 * @return {String} currently selected product id
 */
//this.selectedProductId = () => currentProduct.get("productId");
this.selectedProductId = function () {
  return currentProduct.get("productId");
};

/**
 * selectedVariantId
 * @summary get the currently active/requested variant
 * @return {String} currently selected variant id
 */
this.selectedVariantId = function () {
  let id = currentProduct.get("variantId");
  if (id !== null) {
    return id;
  }
  const variants = getVariants();

  if (!(variants.length > 0)) {
    return [];
  }

  id = variants[0]._id;
  currentProduct.set("variantId", id);
  return id;
};

/**
 * checkChildVariants
 * @summary return number of child variants for a parent
 * @param {String} parentVariantId - parentVariantId
 * @return {Number} count of childVariants for this parentVariantId
 */
this.checkChildVariants = function (parentVariantId) {
  const childVariants = getVariants(parentVariantId);
  return childVariants.length ? childVariants.length : 0;
};

/**
 * checkInventoryVariants
 * @summary return number of inventory variants for a parent
 * @param {String} parentVariantId - parentVariantId
 * @todo could be combined with checkChildVariants in one method
 * @return {Number} count of inventory variants for this parentVariantId
 */
this.checkInventoryVariants = function (parentVariantId) {
  const inventoryVariants = getVariants(parentVariantId, "inventory");
  return inventoryVariants.length ? childVariants.length : 0;
};

/**
 * getVariantPriceRange
 * @summary get price range of a variant if it has child options.
 * if no child options, return main price value
 * @todo remove string return and replace with object
 * @param {String} [id] - current variant _Id
 * @return {String} formatted price or price range
 */
this.getVariantPriceRange = id => ReactionCore.getVariantPriceRange(id ||
  selectedVariant()._id);


/**
 * getProductPriceRange
 * @summary get price range of a product
 * if no only one price available, return it
 * otherwise return a string range
 * @todo remove string return and replace with object
 * @param {String} [id] - current product _id
 * @return {String} formatted price or price range
 */
this.getProductPriceRange = id => ReactionCore.getProductPriceRange(id ||
  selectedProductId());


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

/**
 * getVariantQuantity
 * @description middleware method which calls the same named common method.
 * @todo maybe we could remove this after 1.3. But for now I like how it looks.
 * @param {Object} doc - variant object
 * @return {Number} summary of options quantity or top-level variant
 * inventoryQuantity
 */
this.getVariantQuantity = doc => ReactionCore.getVariantQuantity(doc);

/**
 * @method getVariants
 * @description Get all parent variants
 * @summary could be useful for products and for top level variants
 * @param {String} [id] - product _id
 * @param {String} [type] - type of variant
 * @return {Array} Parent variants or empty array
 */
this.getVariants = (id, type) => ReactionCore.getVariants(id ||
  selectedProductId(), type);

/**
 * @method getTopVariants
 * @description Get only product top level variants
 * @param {String} [id] - product _id
 * @return {Array} Product top level variants or empty array
 */
this.getTopVariants = id => ReactionCore.getTopVariants(id ||
  selectedProductId());
