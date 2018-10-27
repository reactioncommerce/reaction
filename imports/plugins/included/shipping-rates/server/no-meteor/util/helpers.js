/**
 * @name asyncForEach
 * @method
 * @summary async version of `forEach`
 * @param {Array} array - Array to iterate over
 * @param {Function} callback - function to execute against each item in the array
 * @return {undefined}
 */
export async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

/**
 * @name getCatalogProducts
 * @summary Returns products in the Catalog collection that correspond to the cart items provided.
 * @param {Object} collections - The mongo collections
 * @param {Array} items - An array of items that have been added to the shopping cart.
 * @returns {Array} products - An array of products in the catalog
 */
export async function getCatalogProducts(collections, items) {
  const { Catalog } = collections;
  const productIds = items.map((item) => item.productId);

  const products = await Catalog.find({ "product.productId": { $in: productIds } }).toArray();

  return products;
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
      foundTag = tags.find((tag) => tag._id === id);
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
