import createEngine from "../utils/engineHelpers.js";

/**
 * @summary return items from the cart that meet inclusion criteria
 * @param {Object} context - The application context
 * @param {Object} params - the cart to evaluate for eligible items
 * @param {Object} almanac - the rule to evaluate against
 * @return {Promise<Array<Object>>} - An array of eligible cart items
 */
export default async function getEligibleItems(context, params, almanac) {
  const cart = await almanac.factValue("cart");
  const eligibleItems = [];
  if (params.inclusionRule) {
    const engine = createEngine(context, params.inclusionRule);
    for (const item of cart.items) {
      const facts = { item };

      // eslint-disable-next-line no-await-in-loop
      const results = await engine.run(facts);
      const { failureResults } = results;
      if (failureResults.length === 0) {
        eligibleItems.push(item);
      }
    }
  } else {
    eligibleItems.push(...cart.items);
  }

  const filteredItems = [];
  if (eligibleItems.length > 0 && params.exclusionRule) {
    const engine = createEngine(context, params.exclusionRule);
    for (const item of filteredItems) {
      const facts = { item };
      // eslint-disable-next-line no-await-in-loop
      const { events } = await engine.run(facts);
      if (events.length === 0) {
        filteredItems.push(item);
      }
    }
  } else {
    filteredItems.push(...eligibleItems);
  }

  return filteredItems;
}
