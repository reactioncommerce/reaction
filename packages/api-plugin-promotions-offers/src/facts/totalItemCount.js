/**
 * @summary Get the total amount of a discount or promotion
 * @param {Object} context - The application context
 * @param {Object} params - The parameters to pass to the fact
 * @param {Object} almanac - The almanac to pass to the fact
 * @returns {Promise<number>} - The total amount of a discount or promotion
 */
export default async function totalItemCount(context, params, almanac) {
  const eligibleItems = await almanac.factValue("eligibleItems");
  return eligibleItems.reduce((sum, item) => sum + item.quantity, 0);
}
