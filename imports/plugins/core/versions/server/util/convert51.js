import _ from "lodash";

/**
 *
 * @method getVariantInventoryNotAvailableToSellQuantity
 * @summary Get the number of product variants that are currently reserved in an order.
 * This function can take any variant object.
 * @param {Object} variant - A product variant object.
 * @param {Object} collections - Raw mongo collections.
 * @returns {Promise<number>} Reserved variant quantity.
 */
function getVariantInventoryNotAvailableToSellQuantity(variant, collections) {
  // Find orders that are new or processing
  const orders = collections.Orders.find({
    "workflow.status": { $in: ["new", "coreOrderWorkflow/processing"] },
    "shipping.items.variantId": variant._id
  }).fetch();

  const reservedQuantity = orders.reduce((sum, order) => {
    // Reduce through each fulfillment (shipping) object
    const shippingGroupsItems = order.shipping.reduce((acc, shippingGroup) => {
      // Get all items in order that match the item being adjusted
      const matchingItems = shippingGroup.items.filter((item) => item.variantId === variant._id);

      // Reduce `quantity` fields of matched items into single number
      const reservedQuantityOfItem = matchingItems.reduce((quantity, matchingItem) => quantity + matchingItem.quantity, 0);

      return acc + reservedQuantityOfItem;
    }, 0);

    // Sum up numbers from all fulfillment (shipping) groups
    return sum + shippingGroupsItems;
  }, 0);

  return reservedQuantity;
}

/**
 *
 * @method getVariants
 * @summary Get all of a Product's Variants or only a Product's top level Variants.
 * @param {String} productOrVariantId - A Product or top level Product Variant ID.
 * @param {Object} collections - Raw mongo collections.
 * @param {Boolean} topOnly - True to return only a products top level variants.
 * @returns {Promise<Object[]>} Array of Product Variant objects.
 */
function getVariants(productOrVariantId, collections, topOnly) {
  const { Products } = collections;

  const variants = Products.find({
    ancestors: topOnly ? [productOrVariantId] : productOrVariantId,
    type: "variant",
    isVisible: true,
    isDeleted: { $ne: true }
  }).fetch();

  return variants;
}

/**
 *
 * @method getTopLevelVariant
 * @summary Get a top level variant based on provided ID
 * @param {String} productOrVariantId - A variant or top level Product Variant ID.
 * @param {Object} collections - Raw mongo collections.
 * @returns {Promise<Object[]>} Top level product object.
 */
function getTopLevelVariant(productOrVariantId, collections) {
  const { Products } = collections;

  // Find a product or variant
  let product = Products.findOne({
    _id: productOrVariantId
  });

  // If the found product has two ancestors, this means it's an option, and we get it's parent variant
  //  otherwise we have the top level variant, and we return it.
  if (product && Array.isArray(product.ancestors) && product.ancestors.length && product.ancestors.length === 2) {
    product = Products.findOne({
      _id: product.ancestors[1]
    });
  }

  return product;
}

/**
 *
 * @method getVariantInventoryAvailableToSellQuantity
 * @summary Get the number of product variants still avalible to sell. This calculates based off of `inventoryAvailableToSell`.
 * This function can take only a top level variant object and a mongo collection as params to return the product
 * variant quantity. This method can also take a top level variant, mongo collection and an array of
 * product variant options as params to skip the db lookup and return the variant quantity
 * based on the provided options.
 * @param {Object} variant - A top level product variant object.
 * @param {Object} collections - Raw mongo collections.
 * @param {Object[]} variants - Array of product variant option objects.
 * @returns {Promise<number>} Variant quantity.
 */
function getVariantInventoryAvailableToSellQuantity(variant, collections, variants) {
  let options;
  if (variants) {
    options = variants.filter((option) => option.ancestors[1] === variant._id);
  } else {
    options = getVariants(variant._id, collections);
  }

  if (options && options.length) {
    return options.reduce((sum, option) => sum + (option.inventoryAvailableToSell || 0), 0);
  }

  return variant.inventoryAvailableToSell || 0;
}

/**
 *
 * @method getProductInventoryAvailableToSellQuantity
 * @summary Get the number of product variants still avalible to sell. This calculates based off of `inventoryAvailableToSell`.
 * This function can take only a top product ID and a mongo collection as params to return the product
 * `inventoryAvailableToSell` quantity, which is a calculation of the sum of all variant `inventoryAvailableToSell` quantities.
 * @param {Object} productId - A top level product variant object.
 * @param {Object} collections - Raw mongo collections.
 * @param {Object[]} variants - Array of product variant option objects.
 * @returns {Promise<number>} Variant quantity.
 */
function getProductInventoryAvailableToSellQuantity(productId, collections) {
  const variants = getVariants(productId, collections, true);

  if (variants && variants.length) {
    return variants.reduce((sum, variant) => sum + (variant.inventoryAvailableToSell || 0), 0);
  }
  return 0;
}

/**
 *
 * @method getVariantInventoryInStockQuantity
 * @summary Get the number of product variants in stock. This calculates based off of `inventoryQuantity`.
 * This function can take only a top level variant object and a mongo collection as params to return the product
 * variant quantity. This method can also take a top level variant, mongo collection and an array of
 * product variant options as params to skip the db lookup and return the variant quantity
 * based on the provided options.
 * @param {Object} variant - A top level product variant object.
 * @param {Object} collections - Raw mongo collections.
 * @param {Object[]} variants - Array of product variant option objects.
 * @returns {Promise<number>} Variant quantity.
 */
function getVariantInventoryInStockQuantity(variant, collections, variants) {
  let options;
  if (variants) {
    options = variants.filter((option) => option.ancestors[1] === variant._id);
  } else {
    options = getVariants(variant._id, collections);
  }

  if (options && options.length) {
    return options.reduce((sum, option) => sum + (option.inventoryQuantity || option.inventoryAvailableToSell) || 0, 0);
  }
  return variant.inventoryQuantity || 0;
}

/**
 *
 * @method getProductInventoryInStockQuantity
 * @summary Get the number of product variants still avalible to sell. This calculates based off of `inventoryQuantity`.
 * This function can take only a top product ID and a mongo collection as params to return the product
 * `inventoryQuantity` quantity, which is a calculation of the sum of all variant `inventoryQuantity` quantities.
 * @param {Object} productId - A top level product variant object.
 * @param {Object} collections - Raw mongo collections.
 * @param {Object[]} variants - Array of product variant option objects.
 * @returns {Promise<number>} Variant quantity.
 */
function getProductInventoryInStockQuantity(productId, collections) {
  const variants = getVariants(productId, collections, true);

  if (variants && variants.length) {
    return variants.reduce((sum, variant) => sum + (variant.inventoryQuantity || variant.inventoryAvailableToSell) || 0, 0);
  }
  return 0;
}


/**
 *
 * @method updateParentVariantsInventoryAvailableToSellQuantity
 * @summary Get the number of product variants that are currently reserved in an order.
 * This function can take any variant object.
 * @param {Object} item - A product item object, either from the cart or the products catalog
 * @param {Object} collections - Raw mongo collections.
 * @returns {Promise<number>} Reserved variant quantity.
 */
function updateParentVariantsInventoryAvailableToSellQuantity(item, collections) {
  // Since either a cart item or a product catalog item can be provided, we need to determine
  // the parent based on different data
  // If this is a cart item, `productId` and `variantId` are fields on the object
  // If this is a product object, _id is the equivalent of `variantId`, and `ancestors[0]` is the productId
  let updateProductId;
  let updateVariantId;
  if (item.variantId && item.productId) {
    updateProductId = item.productId;
    updateVariantId = item.variantId;
  } else {
    updateProductId = item.ancestors[0]; // eslint-disable-line
    updateVariantId = item._id;
  }

  // Check to see if this item is the top level variant, or an option
  const topLevelVariant = getTopLevelVariant(updateVariantId, collections);
  // If item is an option, update the quantity on its parent variant too
  if (topLevelVariant._id !== updateVariantId) {
    const variantInventoryAvailableToSellQuantity = getVariantInventoryAvailableToSellQuantity(topLevelVariant, collections);
    const variantInventoryInStockQuantity = getVariantInventoryInStockQuantity(topLevelVariant, collections);

    collections.Products.update(
      {
        _id: topLevelVariant._id
      },
      {
        $set: {
          inventoryAvailableToSell: variantInventoryAvailableToSellQuantity,
          inventoryQuantity: variantInventoryInStockQuantity
        }
      },
      {
        bypassCollection2: true,
        publish: true
      }
    );
  }

  // Update the top level product to be the sum of all variant inventory numbers
  const productInventoryAvailableToSellQuantity = getProductInventoryAvailableToSellQuantity(updateProductId, collections);
  const productInventoryInStockQuantity = getProductInventoryInStockQuantity(updateProductId, collections);

  collections.Products.update(
    {
      _id: updateProductId
    },
    {
      $set: {
        inventoryAvailableToSell: productInventoryAvailableToSellQuantity,
        inventoryQuantity: productInventoryInStockQuantity
      }
    },
    {
      bypassCollection2: true,
      publish: true
    }
  );
  return;
}

/**
 * @param {Object} item The catalog item to transform
 * @param {Object} collections The catalog item to transform
 * @returns {Object} The converted item document
 */
export function addInventoryAvailableToSellFieldToProduct(item, collections) {
  if ((item.type === "variant" && hasChildVariant(item._id, collections)) || (item.type === "variant" && item.ancestors.length === 2)) {
    const reservedQuantity = getVariantInventoryNotAvailableToSellQuantity(item, collections);

    const inventoryInStockQuantity = item.inventoryQuantity || item.inventoryInStock || 0;

    if (!item.inventoryAvailableToSell) {
      item.inventoryAvailableToSell = inventoryInStockQuantity - reservedQuantity;

      collections.Products.update(
        {
          _id: item._id
        },
        {
          $set: {
            inventoryAvailableToSell: item.inventoryQuantity - reservedQuantity
          }
        },
        {
          bypassCollection2: true,
          publish: true
        }
      );

      updateParentVariantsInventoryAvailableToSellQuantity(item, collections);
    }

    return item;
  }

  return { ...item };
}

/**
 *
 * @method hasChildVariant
 * @summary Return true if a Product or Variant has at least 1 child Product that is visible and not deleted.
 * @param {String} productOrVariantId - A Product or Product Variant ID.
 * @param {Object} collections - Raw mongo collections.
 * @returns {Promise<boolean>} True if Product has a child.
 */
function hasChildVariant(productOrVariantId, collections) {
  const { Products } = collections;
  const child = Products.findOne({
    ancestors: productOrVariantId,
    type: "variant",
    isVisible: true,
    isDeleted: { $ne: true }
  });
  return !!child;
}

/**
 * @method canBackorder
 * @summary If all the products variants have inventory policy disabled and inventory management enabled
 * @memberof Catalog
 * @param {Object[]} variants - Array with product variant objects
 * @returns {boolean} is backorder allowed or not for a product
 */
function canBackorder(variants) {
  const results = variants.map((variant) => !variant.inventoryPolicy && variant.inventoryManagement);
  return results.every((result) => result);
}


/**
 * @method isBackorder
 * @summary If all the products variants have inventory policy disabled, inventory management enabled and a quantity of zero return `true`
 * @memberof Catalog
 * @param {Object[]} variants - Array with product variant objects
 * @returns {boolean} is backorder currently active or not for a product
 */
function isBackorder(variants) {
  const results = variants.map((variant) => !variant.inventoryPolicy && variant.inventoryManagement && variant.inventoryAvailableToSell === 0);
  return results.every((result) => result);
}

/**
 * @method isSoldOut
 * @summary If all the product variants have a quantity of 0 return `true`.
 * @memberof Catalog
 * @param {Object[]} variants - Array with top-level variants
 * @returns {Boolean} true if quantity is zero.
 */
function isSoldOut(variants) {
  const results = variants.map((variant) => variant.inventoryManagement && variant.inventoryAvailableToSell <= 0);
  return results.every((result) => result);
}


/**
 * @method isLowQuantity
 * @summary If at least one of the product variants quantity is less than the low inventory threshold return `true`.
 * @memberof Catalog
 * @param {Object[]} variants - Array of child variants
 * @returns {boolean} low quantity or not
 */
function isLowQuantity(variants) {
  const threshold = variants && variants.length && variants[0].lowInventoryWarningThreshold;
  const results = variants.map((variant) => {
    if (variant.inventoryManagement && variant.inventoryAvailableToSell) {
      return variant.inventoryAvailableToSell <= threshold;
    }
    return false;
  });
  return results.some((result) => result);
}

/**
 * @param {Object} item The catalog item to transform
 * @param {Object} collections The catalog item to transform
 * @returns {Object} The converted item document
 */
export function convertCatalogItemVariants(item, collections) {
  const { Products } = collections;

  // Get all variants of the product.
  // All variants are needed as we need to match the currently published variants with
  // their counterparts from the products collection. We don't want to the inventory numbers
  // to be invalid just because a product has been set to not visible while that change has
  // not yet been published to the catalog.
  // The catalog will be used as the source of truth for the variants and options.
  const product = Products.findOne({
    _id: item.product._id
  });

  const variants = Products.find({
    ancestors: item.product._id
  }).fetch();

  const topVariants = new Map();
  const options = new Map();

  variants.forEach((variant) => {
    if (variant.ancestors.length === 2) {
      const parentId = variant.ancestors[1];
      if (options.has(parentId)) {
        options.get(parentId).push(variant);
      } else {
        options.set(parentId, [variant]);
      }
    } else {
      topVariants.set(variant._id, variant);
    }
  });

  const catalogProductVariants = item.product.variants.map((variant) => {
    const catalogVariantOptions = variant.options || [];
    const topVariantFromProductsCollection = topVariants.get(variant._id);
    const variantOptionsFromProductsCollection = options.get(variant._id);
    const catalogVariantOptionsMap = new Map();

    catalogVariantOptions.forEach((catalogVariantOption) => {
      catalogVariantOptionsMap.set(catalogVariantOption._id, catalogVariantOption);
    });

    // We only want the variant options that are currently published to the catalog.
    // We need to be careful, not to publish variant or options to the catalog
    // that an operator may not wish to be published yet.
    const variantOptions = _.intersectionWith(
      variantOptionsFromProductsCollection, // array to filter
      catalogVariantOptions, // Items to exclude
      ({ _id: productVariantId }, { _id: catalogItemVariantOptionId }) => (
        // Exclude options from the products collection that aren't in the catalog collection
        productVariantId === catalogItemVariantOptionId
      )
    );

    let updatedVariantFields;
    if (variantOptions) {
      // For variants with options, update the inventory flags for the top-level variant and options
      updatedVariantFields = {
        canBackorder: canBackorder(variantOptions),
        inventoryAvailableToSell: topVariantFromProductsCollection.inventoryAvailableToSell,
        inventoryInStock: topVariantFromProductsCollection.inventoryQuantity || topVariantFromProductsCollection.inventoryInStock,
        isBackorder: isBackorder(variantOptions),
        isLowQuantity: isLowQuantity(variantOptions),
        isSoldOut: isSoldOut(variantOptions),
        options: variantOptions.map((option) => ({
          ...catalogVariantOptionsMap.get(option._id),
          canBackorder: canBackorder([option]),
          inventoryAvailableToSell: option.inventoryAvailableToSell,
          inventoryInStock: option.inventoryQuantity || option.inventoryInStock,
          isBackorder: isBackorder([option]),
          isLowQuantity: isLowQuantity([option]),
          isSoldOut: isSoldOut([option])
        }))
      };
    } else {
      // For variants WITHOUT options, update the inventory flags for the top-level variant only
      updatedVariantFields = {
        canBackorder: canBackorder([topVariantFromProductsCollection]),
        inventoryAvailableToSell: topVariantFromProductsCollection.inventoryAvailableToSell,
        inventoryInStock: topVariantFromProductsCollection.inventoryQuantity || topVariantFromProductsCollection.inventoryInStock,
        isBackorder: isBackorder([topVariantFromProductsCollection]),
        isLowQuantity: isLowQuantity([topVariantFromProductsCollection]),
        isSoldOut: isSoldOut([topVariantFromProductsCollection])
      };
    }

    return {
      ...variant,
      ...updatedVariantFields
    };
  });

  const catalogProduct = {
    ...item.product,
    inventoryAvailableToSell: product.inventoryAvailableToSell,
    inventoryInStock: product.inventoryQuantity || product.inventoryInStock,
    isBackorder: isBackorder(variants),
    isLowQuantity: isLowQuantity(variants),
    isSoldOut: isSoldOut(variants),
    variants: catalogProductVariants
  };

  const doc = {
    _id: item._id,
    product: catalogProduct,
    shopId: item.shopId,
    createdAt: item.createdAt
  };

  return doc;
}
