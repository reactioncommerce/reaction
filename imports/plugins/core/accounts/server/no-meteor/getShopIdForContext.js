import { get } from "lodash";

/**
 * @summary Returns the current account's active shop ID,
 *   if any, or shop ID for the domain in ROOT_URL
 *   or, if none found, the ID of the shop where shopType
 *   is "primary".
 * @param {Object} context Per-request app context
 * @returns {String|null} Shop ID or `null`
 */
export default async function getShopIdForContext(context) {
  const { collections, user } = context;

  if (user) {
    const shopId = get(user, "profile.preferences.reaction.activeShopId");
    if (shopId) return shopId;
  }

  // if still not found, use the primaryShopId query
  return context.queries.primaryShopId(collections);
}
