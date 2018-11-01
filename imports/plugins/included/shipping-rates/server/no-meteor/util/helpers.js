import findVariantInCatalogProduct from "/imports/plugins/core/catalog/server/no-meteor/utils/findVariantInCatalogProduct";
import _ from "lodash";

/**
 * @name findCatalogProductsAndVariants
 * @summary Returns products in the Catalog collection that correspond to the cart items provided.
 * @param {Object} collections - The mongo collections
 * @param {Array} orderLineItems - An array of items that have been added to the shopping cart.
 * @returns {Array} products - An array of products, parent variant and variants in the catalog
 */
export async function findCatalogProductsAndVariants(collections, orderLineItems) {
  const { Catalog } = collections;
  const productIds = orderLineItems.map((orderLineItem) => orderLineItem.productId);

  const catalogProductItems = await Catalog.find({
    "product.productId": { $in: productIds },
    "product.isVisible": true,
    "product.isDeleted": { $ne: true },
    "isDeleted": { $ne: true }
  }).toArray();

  const catalogProductsAndVariants = catalogProductItems.map((catalogProduct) => {
    const { product } = catalogProduct;
    const orderedVariant = orderLineItems.find((item) => item.productId === product.productId);

    const { parentVariant, variant } = findVariantInCatalogProduct(product, orderedVariant.variantId);

    return {
      product,
      parentVariant,
      variant
    };
  });

  return catalogProductsAndVariants;
}

/**
 * @name pick
 * @summary Extracts specified keys from a provided object
 * @param {Object} obj - The target object to filter keys from
 * @param {Array} keys - An array of white-listed keys to include in the returned object.
 * @returns {Object} - An object containing only white-listed keys
 */
export function pick(obj, keys) {
  return keys.map((k) => (k in obj ? { [k]: obj[k] } : {}))
    .reduce((res, o) => Object.assign(res, o), {});
}

/**
 * @name mergeProductAndVariants
 * @summary Merges a product and its variants
 * @param {Object} productAndVariants - The product and its variants
 * @returns {Object} - The merged product and variants
 */
export function mergeProductAndVariants(productAndVariants) {
  const { product, parentVariant, variant } = productAndVariants;

  // Filter out unnecessary product props
  const productProps = _.omit(product, [
    "variants", "media", "metafields", "parcel", "pricing", " primaryImage", "socialMetadata", "customAttributes"
  ]);

  // Filter out unnecessary variant props
  const variantExcludeProps = ["media", "parcel", "pricing", "primaryImage", "customAttributes"];
  const variantProps = _.omit(variant, variantExcludeProps);

  // If an option has been added to the cart
  if (parentVariant) {
    // Filter out unnecessary parent variant props
    const parentVariantProps = _.omit(parentVariant, variantExcludeProps);

    return {
      ...productProps,
      ...parentVariantProps,
      ...variantProps
    };
  }

  return {
    ...productProps,
    ...variantProps
  };
}

/**
 * @name tagsByIds
 * @summary Finds all tags associated with the provided array of catalog products.
 * @param {Object} collections - The mongo collections
 * @param {Array} catalogProducts - An array of products in the Catalog collection.
 * @returns {Array} - An array of tags and corresponding product ids.
 */
export async function tagsByIds(collections, catalogProducts) {
  const { Tags } = collections;

  const tagIds = catalogProducts.reduce((list, item) => {
    list.push(...item.product.tagIds);
    return list;
  }, []);

  const tags = await Tags.find({ _id: { $in: tagIds } }).toArray();

  return catalogProducts.map((item) => ({
    productId: item.product.productId,
    tags: item.product.tagIds.map((id) => {
      const foundTag = tags.find((tag) => tag._id === id);
      return foundTag ? foundTag.name : null;
    })
  }));
}

/**
 * @constant
 * @type {Object}
*/
export const operators = {
  eq: function (a, b) { return a === b ;},
  gt: function (a, b) { return a > b ;},
  lt: function (a, b) { return a < b; },
  ne: function (a, b) { return a !== b ;}
};

/**
 * @constant
 * @type {Object}
*/
export const propertyTypes = {
  bool: function (a) { return a === "true"; },
  float: function (a) { return parseFloat(a); },
  int: function (a) { return parseInt(a); },
  string: function (a) { return a; }
};
