/**
 * @name discountCodes
 * @method
 * @memberof GraphQL/DiscountCodes
 * @summary Query the Discounts collection
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - ID of Shop to query against
 * @param {Object} filters - filters to be applied
 * @returns {Promise<Object>} DiscountCodes object Promise
 */
export default async function discountCodes(context, shopId, filters) {
  const { collections } = context;
  const { Discounts } = collections;

  await context.validatePermissions("reaction:legacy:discounts", "read", { shopId });

  // Create the mongo selector from the provided filters
  let selector = {
    shopId
  };

  // filter by searchField
  if (filters && filters.searchField) {
    const cond = {
      $regex: filters.searchField,
      $options: "i"
    };
    selector = {
      ...selector,
      $or: [{
        code: cond
      }, {
        label: cond
      }, {
        description: cond
      }]
    };
  }

  return Discounts.find(selector);
}
