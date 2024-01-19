import createEngine from "./engineHelpers.js";

/**
 * @summary return items from the cart that meet inclusion criteria
 * @param {Object} context - The application context
 * @param {Array<Object>} items - The cart items to evaluate for eligible items
 * @param {Object} params - The parameters to evaluate against
 * @return {Promise<Array<Object>>} - An array of eligible cart items
 */
export default async function getEligibleItems(context, items, params) {
  const getCheckMethod = (inclusionRules, exclusionRules) => {
    const includeEngine = inclusionRules ? createEngine(context, inclusionRules) : null;
    const excludeEngine = exclusionRules ? createEngine(context, exclusionRules) : null;

    return async (item) => {
      if (includeEngine) {
        const results = await includeEngine.run({ item });
        const { failureResults } = results;
        const failedIncludeTest = failureResults.length > 0;
        if (failedIncludeTest) return false;
      }

      if (excludeEngine) {
        const { failureResults } = await excludeEngine.run({ item });
        const failedExcludeTest = failureResults.length > 0;
        return failedExcludeTest;
      }

      return true;
    };
  };

  const checkerMethod = getCheckMethod(params.inclusionRules, params.exclusionRules);

  const eligibleItems = [];
  for (const item of items) {
    // eslint-disable-next-line no-await-in-loop
    if (await checkerMethod(item)) {
      eligibleItems.push(item);
    }
  }
  return eligibleItems;
}
