/**
 *  currentProduct
 *  @summary Reactive current product dependency, ensuring reactive products, without session
 *  @todo rename as this can easily be confused with ReactionCore.setProduct
 *  @todo this is a messy class implementation, normalize it.
 *  @description
 *  products:

 */
ReactionProduct = new ReactiveDict("currentProduct");

Tracker.autorun(function () {
  ReactionRouter.watchPathChange();
  if (ReactionRouter.getParam("handle")) {
    const prodSub = ReactionSubMan.subscribe("Product", ReactionRouter.getParam("handle"));
    if (prodSub.ready()) {
      return ReactionProduct.setProduct(ReactionRouter.getParam("handle"), ReactionRouter.getParam("variant"));
    }
  }
});

/**
 * setCurrentVariant
 * @param {String} variantId - set current variantId
 * @return {undefined}
 */
ReactionProduct.setCurrentVariant = (variantId) => {
  let currentId;
  if (variantId === null) {
    ReactionProduct.set("variant", null);
    ReactionProduct.set("variant", ReactionProduct.selectedVariantId());
  }
  if (!variantId) {
    return;
  }
  currentId = ReactionProduct.selectedVariantId();
  if (currentId === variantId) {
    return;
  }
  ReactionProduct.set("variant", variantId);
};

/**
 * ReactionCore.setProduct
 * @summary method to set default/parameterized product variant
 * @param {String} currentProductId - set current productId
 * @param {String} currentVariantId - set current variantId
 * @return {undefined} return nothing, sets in session
 */
ReactionProduct.setProduct = (currentProductId, currentVariantId) => {
  let productId = currentProductId || ReactionRouter.getParam("handle");
  let variantId = currentVariantId || ReactionRouter.getParam("variant");
  let handle;
  if (!productId.match(/^[A-Za-z0-9]{17}$/)) {
    handle = productId.toLowerCase();
    product = ReactionCore.Collections.Products.findOne({
      handle: handle
    });
  }
  ReactionProduct.set("handle", handle);
  ReactionProduct.set("variant", variantId);
};


/**
 * selectedProduct
 * @summary get the currently active/requested product object
 * @return {Object|undefined} currently selected product cursor
 */
ReactionProduct.selectedProduct = () => {
  const handle  = ReactionRouter.getParam("handle") || ReactionProduct.get("handle");
  const product = ReactionCore.Collections.Products.findOne({
    handle: handle
  });
  return product;
};

/**
 * selectedProductId
 * @summary get the currently active/requested product
 * @return {String} currently selected product id
 */
ReactionProduct.selectedProductId = () => {
  if (ReactionProduct.selectedProduct() !== undefined) {
    return ReactionProduct.selectedProduct()._id;
  }
};

/**
 * selectedVariant
 * @summary get the currently active/requested variant object
 * @return {Object} currently selected variant object
 */
ReactionProduct.selectedVariant = () => {
  const product = ReactionProduct.selectedProduct();
  const id = ReactionProduct.selectedVariantId();
  if (!id) {
    return {};
  }

  if (!product) {
    return {};
  }
  let variant = _.findWhere(product.variants, {
    _id: id
  });
  return variant;
};


/**
 * selectedVariantId
 * @summary get the currently active/requested variant
 * @return {String} currently selected variant id
 */
ReactionProduct.selectedVariantId = () => {
  let id = ReactionProduct.get("variant");
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
  ReactionProduct.set("variant", id);
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
  const productId = currentProductId || ReactionProduct.selectedProductId();
  const product = ReactionCore.Collections.Products.findOne(productId);
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
        ReactionProduct.setProduct(null);
        ReactionRouter.go("/");
        return Alerts.toast(`Deleted ${title}`, "info");
      }
    });
  }
};
