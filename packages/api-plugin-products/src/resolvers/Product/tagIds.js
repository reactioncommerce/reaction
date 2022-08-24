import { encodeTagOpaqueId } from "../../xforms/id.js";

/**
 * @name Product/tagIds
 * @method
 * @memberof Product/GraphQL
 * @summary Returns the product tagIds prop to opaque IDs
 * @param {Object} product - Product response from parent resolver
 * @returns {String[]} Array of tag IDs
 */
export default function tagsIds(product) {
  const { hashtags } = product;
  if (!hashtags || hashtags.length === 0) return [];

  return hashtags.map(encodeTagOpaqueId);
}
