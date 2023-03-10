/**
 * @summary create a new location mutation
 * @param {Object} _ - unused
 * @param {Object} param.input - The input arguments
 * @param {Object} context - The application context
 * @return {Promise<boolean>} - true if success
 */
export default async function createLocation(_, { input }, context) {
  const location = input;
  const { shopId } = input;
  await context.validatePermissions("reaction:legacy:locations", "create", { shopId });
  const createLocationResults = await context.mutations.createLocation(context, { location, shopId });
  return createLocationResults;
}
