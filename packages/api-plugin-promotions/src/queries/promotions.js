/**
 * @summary return a possibly filtered list of promotions
 * @param {Object} context - The application context
 * @param {String} shopId - The shopId to query for
 * @param {Object} filter - optional filter parameters
 * @return {Promise<Promotions>} - A list of promotions
 */
export default async function promotions(context, shopId, filter) {
  const { enabled } = filter;
  const { collections: { Promotions } } = context;


  // because enabled could be false we need to check for undefined
  if (typeof enabled !== "undefined") {
    filter.enabled = enabled;
  }
  filter.shopId = shopId;
  return Promotions.find(filter);
}
