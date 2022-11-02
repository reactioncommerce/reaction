/**
 * @summary Get the total amount of a discount or promotion
 * @param {Object} context - The application context
 * @param {Object} params - The parameters to pass to the fact
 * @param {Object} almanac - The almanac to pass to the fact
 * @returns {Promise<number>} - The total amount of a discount or promotion
 */
export default async function totalItemCount(context, params, almanac) {
  let calculationItems = [];
  if (params.fromFact) {
    calculationItems = await almanac.factValue(params.fromFact);
  } else {
    calculationItems = await almanac.factValue("cart").then((cart) => cart.items);
  }
  return calculationItems.reduce((sum, item) => sum + item.quantity, 0);
}
