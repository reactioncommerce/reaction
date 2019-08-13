import _ from "lodash";

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
