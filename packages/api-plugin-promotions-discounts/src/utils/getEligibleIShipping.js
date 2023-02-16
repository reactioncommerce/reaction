import createEngine from "./engineHelpers.js";

/**
 * @summary return shipping from the cart that meet inclusion criteria
 * @param {Object} context - The application context
 * @param {Array<Object>} shipping - The cart shipping to evaluate for eligible shipping
 * @param {Object} params - The parameters to evaluate against
 * @return {Promise<Array<Object>>} - An array of eligible cart shipping
 */
export default async function getEligibleShipping(context, shipping, params) {
  const getCheckMethod = (inclusionRules, exclusionRules) => {
    const includeEngine = inclusionRules ? createEngine(context, inclusionRules) : null;
    const excludeEngine = exclusionRules ? createEngine(context, exclusionRules) : null;

    return async (shippingItem) => {
      if (includeEngine) {
        const results = await includeEngine.run({ shipping: shippingItem });
        const { failureResults } = results;
        const failedIncludeTest = failureResults.length > 0;
        if (failedIncludeTest) return false;
      }

      if (excludeEngine) {
        const { failureResults } = await excludeEngine.run({ shipping: shippingItem });
        const failedExcludeTest = failureResults.length > 0;
        return failedExcludeTest;
      }

      return true;
    };
  };

  const checkerMethod = getCheckMethod(params.inclusionRules, params.exclusionRules);

  const eligibleShipping = [];
  for (const shippingItem of shipping) {
    // eslint-disable-next-line no-await-in-loop
    if (await checkerMethod(shippingItem)) {
      eligibleShipping.push(shippingItem);
    }
  }
  return eligibleShipping;
}
