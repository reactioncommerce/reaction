/**
 * @name taxRates
 * @method
 * @memberof GraphQL/TaxRates
 * @summary Query the Taxes collection
 * @param {Object} context - an object containing the per-request state
 * @param {String} shopId - ID of Shop to query against
 * @returns {Promise<Object>} Taxes object Promise
 */
export default async function taxRates(context, shopId) {
  const { checkPermissions, collections } = context;
  const { Taxes } = collections;

  await checkPermissions(["owner", "admin"], shopId);

  return Taxes.find({
    shopId
  });
}
