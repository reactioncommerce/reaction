/**
 * @summary Returns address validation rules
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - mutation input
 * @returns {Promise<Mongo.Cursor>} MongoDB cursor for the query
 */
export default async function addressValidationRules(context, input) {
  const { serviceName, shopId } = input;
  const { checkPermissions, collections } = context;
  const { AddressValidationRules } = collections;

  await checkPermissions(["admin"], shopId);

  const query = { shopId };

  // Service name is optional but we filter by it if provided
  if (serviceName) query.serviceName = serviceName;

  return AddressValidationRules.find(query);
}
