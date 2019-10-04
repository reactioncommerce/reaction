import { encodeTagOpaqueId } from "../../xforms/id.js";

/**
 * @name CatalogProduct/tagIds
 * @method
 * @memberof Catalog/GraphQL
 * @summary Returns the product tagIds prop to opaque IDs
 * @param {Object} product - CatalogProduct response from parent resolver
 * @returns {String[]} Array of tag IDs
 */
export default function tagsIds(product) {
  const { tagIds } = product;
  if (!tagIds || tagIds.length === 0) return [];

  return tagIds.map(encodeTagOpaqueId);
}
