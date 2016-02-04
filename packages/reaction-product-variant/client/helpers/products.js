/**
 *  currentProduct
 *  @summary Reactive current product dependency, ensuring reactive products, without session
 *  @todo rename as this can easily be confused with ReactionCore.setCurrentProduct
 *  @todo this is a messy class implementation, normalize it.
 *  @description
 *  products:
 *  set usage: ReactionProduct.currentProduct.set "productId",string
 *  get usage: ReactionProduct.currentProduct.get "productId"
 *  variants:
 *  set usage: ReactionProduct.currentProduct.set "variantId",string
 *  get usage: ReactionProduct.currentProduct.get "variantId"
 */
ReactionProduct = {};
ReactionProduct.currentProduct = {
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
// ReactionCore.currentProduct = currentProduct = this.currentProduct;

/**
 * setCurrentVariant
 * @param {String} variantId - set current variantId
 * @return {undefined}
 */
ReactionProduct.setCurrentVariant = (variantId) => {
  let currentId;
  if (variantId === null) {
    ReactionProduct.currentProduct.set("variantId", null);
    ReactionProduct.currentProduct.set("variantId", ReactionProduct.selectedVariantId());
  }
  if (!variantId) {
    return;
  }
  currentId = ReactionProduct.selectedVariantId();
  if (currentId === variantId) {
    return;
  }
  ReactionProduct.currentProduct.set("variantId", variantId);
};

/**
 * setCurrentProduct
 * @param {String} productId - set current productId
 * @return {undefined}
 */
ReactionProduct.setCurrentProduct = (productId) => {
  let currentId;

  if (productId === null) {
    ReactionProduct.currentProduct.set("productId", null);
  }
  if (!productId) {
    return;
  }
  currentId = ReactionProduct.selectedProductId();
  if (currentId === productId) {
    return;
  }
  ReactionProduct.currentProduct.set("productId", productId);
  ReactionProduct.currentProduct.set("variantId", null);
};

/**
 * ReactionCore.setProduct
 * @summary method to set default/parameterized product variant
 * @param {String} currentProductId - set current productId
 * @param {String} currentVariantId - set current variantId
 * @return {undefined} return nothing, sets in session
 */
ReactionProduct.setProduct = (currentProductId, currentVariantId) => {
  let productId = currentProductId;
  let variantId = currentVariantId;
  if (!productId.match(/^[A-Za-z0-9]{17}$/)) {
    let product = ReactionCore.Collections.Products.findOne({
      handle: productId.toLowerCase()
    });
    if (product) {
      productId = product._id;
    }
  }
  ReactionProduct.setCurrentProduct(productId);
  ReactionProduct.setCurrentVariant(variantId);
};


/**
 * selectedVariant
 * @summary get the currently active/requested variant object
 * @return {Object} currently selected variant object
 */
ReactionProduct.selectedVariant = () => {
  let id;
  let product;
  let variant;
  id = ReactionProduct.selectedVariantId();
  if (!id) {
    return {};
  }
  product = ReactionProduct.selectedProduct();
  if (!product) {
    return {};
  }
  variant = _.findWhere(product.variants, {
    _id: id
  });
  return variant;
};

/**
 * selectedProduct
 * @summary get the currently active/requested product object
 * @return {Object|undefined} currently selected product cursor
 */
ReactionProduct.selectedProduct = () => {
  const id = ReactionProduct.selectedProductId();
  if (typeof id === "string") {
    return ReactionCore.Collections.Products.findOne(id);
  }
};

/**
 * selectedProductId
 * @summary get the currently active/requested product
 * @return {String} currently selected product id
 */
ReactionProduct.selectedProductId = () => {
  return ReactionProduct.currentProduct.get("productId");
};

/**
 * selectedVariantId
 * @summary get the currently active/requested variant
 * @return {String} currently selected variant id
 */
ReactionProduct.selectedVariantId = () => {
  let id = ReactionProduct.currentProduct.get("variantId");
  if (id !== null) {
    return id;
  }

  let product = ReactionProduct.selectedProduct();
  if (!product) {
    return [];
  }

  let variants = (function () {
    let results = [];
    for (let variant of product.variants) {
      if (!variant.parentId) {
        results.push(variant);
      }
    }
    return results;
  })();

  if (!(variants.length > 0)) {
    return [];
  }

  id = variants[0]._id;
  ReactionProduct.currentProduct.set("variantId", id);
  return id;
};

/**
 * checkChildVariants
 * @summary return number of child variants for a parent
 * @param {String} parentVariantId - parentVariantId
 * @return {Number} count of childVariants for this parentVariantId
 */
ReactionProduct.checkChildVariants = (parentVariantId) => {
  let product = ReactionProduct.selectedProduct();
  if (!product) {
    return 0;
  }

  let childVariants = (function () {
    let results = [];
    for (variant of product.variants) {
      if ((variant !== null ? variant.parentId : void 0) ===
        parentVariantId && (variant !== null ? variant.type : void 0) !==
        "inventory") {
        results.push(variant);
      }
    }
    return results;
  })();
  return childVariants.length;
};

/**
 * checkInventoryVariants
 * @summary return number of inventory variants for a parent
 * @param {String} parentVariantId - parentVariantId
 * @return {Number} count of inventory variants for this parentVariantId
 */
ReactionProduct.checkInventoryVariants = (parentVariantId) => {
  let product = ReactionProduct.selectedProduct();
  if (!product) {
    return 0;
  }

  let inventoryVariants = (function () {
    let results = [];
    for (variant of product.variants) {
      if ((variant !== null ? variant.parentId : void 0) ===
        parentVariantId && (variant !== null ? variant.type : void 0) ===
        "inventory") {
        results.push(variant);
      }
    }
    return results;
  })();
  return inventoryVariants.length;
};

/**
 * getVariantPriceRange
 * @summary get price range of a variant if it has child options.
 * if no child options, return main price value
 * @todo remove string return and replace with object
 * @param {String} currentVariantId - currentVariantId
 * @param {String} currentProductId - currentProductId
 * @return {String} formatted price or price range
 */
ReactionProduct.getVariantPriceRange = (currentVariantId, currentProductId) => {
  let productId = currentProductId || ReactionProduct.selectedProductId();
  let variantId = currentVariantId || ReactionProduct.selectedVariant()._id;

  let product = ReactionCore.Collections.Products.findOne(productId);
  if (!(variantId && productId && product)) {
    return undefined;
  }

  let variant = _.findWhere(product.variants, {
    _id: variantId
  });

  let children = (function () {
    let results = [];
    for (let thisVariant of product.variants) {
      if (thisVariant.parentId === variantId) {
        results.push(thisVariant);
      }
    }
    return results;
  })();

  if (children.length === 0) {
    if (typeof variant === "object" ? variant.price : void 0) {
      return variant.price;
    }
    return undefined;
  }

  if (children.length === 1) {
    return children[0].price;
  }

  let priceMin = Number.POSITIVE_INFINITY;
  let priceMax = Number.NEGATIVE_INFINITY;

  for (let child of children) {
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
  return `${priceMin} - ${priceMax}`;
};

/**
 * getProductPriceRange
 * @summary get price range of a product
 * if no only one price available, return it
 * otherwise return a string range
 * @todo remove string return and replace with object
 * @param {String} currentProductId - currentProductId
 * @return {String} formatted price or price range
 */
ReactionProduct.getProductPriceRange = (currentProductId) => {
  let productId = currentProductId || ReactionProduct.selectedProductId();
  let product = ReactionCore.Collections.Products.findOne(productId);

  if (!product) {
    return undefined;
  } else if (!product._id) {
    return undefined;
  }

  let variants = (function () {
    let results = [];
    for (let variant of product.variants) {
      if (!variant.parentId) {
        results.push(variant);
      }
    }
    return results;
  })();

  if (variants.length > 0) {
    let variantPrices = [];
    for (let variant of variants) {
      let range = ReactionProduct.getVariantPriceRange(variant._id, productId);
      if (Match.test(range, String)) {
        let firstPrice = parseFloat(range.substr(0, range.indexOf(" ")));
        let lastPrice = parseFloat(range.substr(range.lastIndexOf(" ") + 1));
        variantPrices.push(firstPrice, lastPrice);
      } else {
        variantPrices.push(range);
      }
    }
    let priceMin = _.min(variantPrices);
    let priceMax = _.max(variantPrices);
    if (priceMin === priceMax) {
      return priceMin;
    }
    return `${priceMin} - ${priceMax}`;
  }
};

/**
 * maybeDeleteProduct
 * @summary confirm product deletion, delete, and alert
 * @todo - refactor this back into templates. this is bad.
 * @param {Object} product - product Object
 * @return {Object} - returns nothing, and alerts,happen here
 */
ReactionProduct.maybeDeleteProduct = (product) => {
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
        Alerts.toast(`There was an error deleting ${title}`, "error", {
          i18nKey: "productDetail.productDeleteError"
        });
        throw new Meteor.Error("Error deleting product " + id, error);
      } else {
        ReactionProduct.setCurrentProduct(null);
        ReactionRouter.go("/");
        return Alerts.toast(`Deleted ${title}`, "info");
      }
    });
  }
};
