/**
 * @summary Query the Locations collection and return a single location
 * @param {Object} _ - unused
 * @param {Object} params.input - an object of all mutation arguments that were sent by the client
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} Location object
 */
export default async function location(_, { input }, context) {
  const { shopId, _id } = input;
  await context.validatePermissions("reaction:legacy:locations", "read", { shopId });
  return context.queries.location(context, { shopId, _id });
}
