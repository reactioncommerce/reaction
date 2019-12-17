/**
 * @name Query.addressValidationServices
 * @method
 * @memberof Address/GraphQL
 * @summary get all registered address validation services
 * @param {Object} _ - unused
 * @param {Object} args - unused
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object[]>} Array of address validation services
 */
export default async function addressValidationServices(_, args, context) {
  return context.queries.addressValidationServices(context);
}
