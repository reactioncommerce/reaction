/**
 *  currentProduct
 *  @summary Reactive current product dependency, ensuring reactive products, without session
 *  @todo rename as this can easily be confused with ReactionCore.setProduct
 *  @todo this is a messy class implementation, normalize it.
 *  @description
 *  products:

 */
ReactionProduct = new ReactiveDict("currentProduct");

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
  let currentId = ReactionProduct.selectedVariantId();
  if (currentId === variantId) {
    return;
  }
  ReactionProduct.set("variantId", variantId);
};

/**
 * ReactionCore.setProduct
 * this will be deprecated in favor of template.instance data.
 *
 * @summary method to set default/parameterized product variant
 * @param {String} currentProductId - set current productId
 * @param {String} currentVariantId - set current variantId
 * @return {Object} product object
 */
ReactionProduct.setProduct = (currentProductId, currentVariantId) => {
  let productId = currentProductId || ReactionRouter.getParam("handle");
  let variantId = currentVariantId || ReactionRouter.getParam("variantId");
  let product;
  let handle;

  if (!productId.match(/^[A-Za-z0-9]{17}$/)) {
    handle = productId.toLowerCase();
    product = ReactionCore.Collections.Products.findOne({
      handle: handle
    });
    productId = product && product._id;
  } else {
    product = ReactionCore.Collections.Products.findOne({
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

  return product;
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
    return ReactionCore.Collections.Products.findOne(id);
  }
};

/**
 * selectedProduct
 * @summary get the currently active/requested product object
 * @return {Object|undefined} currently selected product cursor
 */
ReactionProduct.selectedProduct = function () {
  const id = ReactionProduct.selectedProductId();
  if (typeof id === "string") {
    return ReactionCore.Collections.Products.findOne(id);
  }
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
 * @return {Number} count of inventory variants for this parentVariantId
 */
ReactionProduct.checkInventoryVariants = function (parentVariantId) {
  const inventoryVariants = ReactionProduct.getVariants(parentVariantId,
    "inventory");
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
ReactionProduct.getVariantPriceRange = id => ReactionCore.
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
ReactionProduct.getProductPriceRange = id => ReactionCore.
  getProductPriceRange(id || ReactionProduct.selectedProductId());

/**
 * maybeDeleteProduct
 * @summary confirm product deletion, delete, and alert
 * @todo - refactor this back into templates. this is bad.
 * @param {Object} product - product Object
 * @return {Object} - returns nothing, and alerts,happen here
 */
ReactionProduct.maybeDeleteProduct = maybeDeleteProduct = (product) => {
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
        ReactionRouter.go("/");
        return Alerts.toast(`Deleted ${title}`, "info");
      }
    });
  }
};

/**
 * getVariantQuantity
 * @description middleware method which calls the same named common method.
 * @todo maybe we could remove this after 1.3. But for now I like how it looks.
 * @param {Object} doc - variant object
 * @return {Number} summary of options quantity or top-level variant
 * inventoryQuantity
 */
ReactionProduct.getVariantQuantity = doc => ReactionCore.getVariantQuantity(doc);

/**
 * @method getVariants
 * @description Get all parent variants
 * @summary could be useful for products and for top level variants
 * @param {String} [id] - product _id
 * @param {String} [type] - type of variant
 * @return {Array} Parent variants or empty array
 */
ReactionProduct.getVariants = (id, type) => ReactionCore.getVariants(id ||
  ReactionProduct.selectedProductId(), type);

/**
 * @method getTopVariants
 * @description Get only product top level variants
 * @param {String} [id] - product _id
 * @return {Array} Product top level variants or empty array
 */
ReactionProduct.getTopVariants = id => ReactionCore.getTopVariants(id ||
  ReactionProduct.selectedProductId());

/**
 * getTag
 * @summary This needed for naming `positions` object. Method could return `tag`
 * route name or shop name as default name.
 * @return {String} tag name or shop name
 */
ReactionProduct.getTag = () => ReactionCore.getCurrentTag() ||
  ReactionCore.getShopName().toLowerCase();
