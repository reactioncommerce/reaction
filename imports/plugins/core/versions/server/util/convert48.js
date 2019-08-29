import _ from "lodash";

/**
 *
 * @method getProductQuantity
 * @summary Get the number of product variants still avalible to purchase. This function can
 * take only a top level variant object as a param to return the product's quantity.
 * This method can also take a top level variant and an array of product variant options as
 * params return the product's quantity.
 * @memberof Catalog
 * @param {Object} variant - A top level product variant object.
 * @param {Object[]} variants - Array of product variant option objects.
 * @returns {number} Variant quantity
 */
export default function getProductQuantity(variant, variants = []) {
  const options = variants.filter((option) => option.ancestors[1] === variant._id);
  if (options && options.length) {
    return options.reduce((sum, option) => sum + (option.inventoryQuantity || 0), 0);
  }
  return variant.inventoryQuantity || 0;
}


/**
 * @method isSoldOut
 * @summary If all the product variants have a quantity of 0 return `true`.
 * @memberof Catalog
 * @param {Object[]} variants - Array with top-level variants
 * @returns {Boolean} true if quantity is zero.
 */
function isSoldOut(variants) {
  const results = variants.map((variant) => {
    const quantity = getProductQuantity(variant, variants);
    return variant.inventoryManagement && quantity <= 0;
  });
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
    const quantity = getProductQuantity(variant, variants);
    if (variant.inventoryManagement && quantity) {
      return quantity <= threshold;
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
        isLowQuantity: isLowQuantity(variantOptions),
        isSoldOut: isSoldOut(variantOptions),
        options: variantOptions.map((option) => ({
          ...catalogVariantOptionsMap.get(option._id),
          isLowQuantity: isLowQuantity([option]),
          isSoldOut: isSoldOut([option])
        }))
      };
    } else {
      // For variants WITHOUT options, update the inventory flags for the top-level variant only
      updatedVariantFields = {
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
