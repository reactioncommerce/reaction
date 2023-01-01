import generateFilterQuery from "@reactioncommerce/api-utils/generateFilterQuery.js";

/**
 * @name filterPromotions
 * @method
 * @memberof GraphQL/Promotions
 * @summary Query the Promotions collection for a list of promotions
 * @param {Object} context - an object containing the per-request state
 * @param {Object} conditions - object containing the filter conditions
 * @param {String} shopId - shopID to filter by
 * @returns {Promise<Object>} Promotions object Promise
 */
export default async function filterPromotions(context, conditions, shopId) {
  const { collections: { Promotions } } = context;

  if (!shopId) {
    throw new Error("shopId is required");
  }
  await context.validatePermissions("reaction:legacy:promotions", "read", { shopId });

  const { filterQuery } = generateFilterQuery(context, "Promotion", conditions, shopId);

  return Promotions.find(filterQuery);
}
