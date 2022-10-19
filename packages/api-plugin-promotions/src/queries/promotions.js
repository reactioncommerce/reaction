/**
 * @summary return a possibly filtered list of promotions
 * @param {Object} context - The application context
 * @param {Object} input - The filters
 * @return {Promise<Promotions>} - A list of promotions
 */
export default async function promotions(context, input) {
  const { shopId, enabled, startDate, endDate } = input;
  const { collections: { Promotions } } = context;


  await context.validatePermissions("reaction:legacy:promotions", "read", { shopId });
  const filter = {
    shopId
  };

  // because enabled could be false we need to check for undefined
  if (typeof enabled !== "undefined") {
    filter.enabled = enabled;
  }

  if (startDate) filter.startDate = startDate;
  if (endDate) filter.endDate = endDate;
  return Promotions.find(filter);
}
