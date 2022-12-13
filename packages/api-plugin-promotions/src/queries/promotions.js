/**
 * @summary return a possibly filtered list of promotions
 * @param {Object} context - The application context
 * @param {String} shopId - The shopId to query for
 * @param {Object} filter - optional filter parameters
 * @return {Promise<Promotions>} - A list of promotions
 */
export default async function promotions(context, shopId, filter) {
  const { collections: { Promotions } } = context;

  const selector = { shopId, state: { $ne: "archived" } };

  if (filter) {
    const { enabled, startDate, endDate, state } = filter;
    // because enabled could be false we need to check for undefined
    if (typeof enabled !== "undefined") {
      selector.enabled = enabled;
    }

    if (state) {
      selector.state = { $eq: state };
    }

    if (startDate && startDate.eq) {
      selector.startDate = { $eq: startDate.eq };
    }

    if (startDate && startDate.before) {
      selector.startDate = { ...selector.startDate, $lt: startDate.before };
    }

    if (startDate && startDate.after) {
      selector.startDate = { ...selector.startDate, $gt: startDate.after };
    }

    if (endDate && endDate.eq) {
      selector.endDate = { $eq: endDate.eq };
    }

    if (endDate && endDate.before) {
      selector.endDate = { ...selector.endDate, $lt: endDate.before };
    }

    if (endDate && endDate.after) {
      selector.endDate = { ...selector.endDate, $gt: endDate.after };
    }
  }

  return Promotions.find(selector);
}
