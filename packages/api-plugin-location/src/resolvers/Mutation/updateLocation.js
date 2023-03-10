/**
 * @summary update a location mutation
 * @param {Object} _ - unused
 * @param {Object} param.input - The input arguments
 * @param {Object} context - The application context
 * @return {Promise<boolean>} - true if success
 */
export default async function updateLocation(_, { input }, context) {
  const location = input;
  const { shopId } = input;
  await context.validatePermissions("reaction:legacy:locations", "update", { shopId });
  const updateLocationResults = await context.mutations.updateLocation(context, { location, shopId });
  return updateLocationResults;
}
