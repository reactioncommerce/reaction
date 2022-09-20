/**
 * @summary Returns address validation rules
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - mutation input
 * @returns {Promise<Mongo.Cursor>} MongoDB cursor for the query
 */
export default async function addressValidationRules(context, input) {
  const { serviceNames, shopId } = input;
  const { collections: { AddressValidationRules } } = context;

  await context.validatePermissions("reaction:legacy:addressValidationRules", "read", { shopId });

  const query = { shopId };

  // Service name is optional but we filter by it if provided
  if (serviceNames) query.serviceName = { $in: serviceNames };

  return AddressValidationRules.find(query);
}
