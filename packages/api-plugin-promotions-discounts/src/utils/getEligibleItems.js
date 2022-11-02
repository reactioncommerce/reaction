import createEngine from "./engineHelpers.js";

/**
 * @summary return items from the cart that meet inclusion criteria
 * @param {Object} context - The application context
 * @param {Array<Object>} items - The cart items to evaluate for eligible items
 * @param {Object} parameters - The parameters to evaluate against
 * @return {Promise<Array<Object>>} - An array of eligible cart items
 */
export default async function getEligibleItems(context, items, parameters) {
  const eligibleItems = [];
  if (parameters.inclusionRule) {
    const engine = createEngine(context, parameters.inclusionRule);
    for (const item of items) {
      const facts = { item };

      // eslint-disable-next-line no-await-in-loop
      const results = await engine.run(facts);
      const { failureResults } = results;
      if (failureResults.length === 0) {
        eligibleItems.push(item);
      }
    }
  } else {
    eligibleItems.push(...items);
  }

  const filteredItems = [];
  if (eligibleItems.length > 0 && parameters.exclusionRule) {
    const engine = createEngine(context, parameters.exclusionRule);
    for (const item of eligibleItems) {
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
