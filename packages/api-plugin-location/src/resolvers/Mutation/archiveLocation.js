/**
 * @method archiveLocation
 * @summary Archive a location mutation
 * @param {Object} _ unused
 * @param {Object} args.input - The input arguments
 * @param {Object} args.input.shopId - The shopId
 * @param {Object} args.input.locationId - The location ID
 * @param {Object} context - The application context
 * @returns {Promise<Object>} with archived location result
 */
export default async function archiveLocation(_, { input }, context) {
  const { shopId } = input;

  await context.validatePermissions("reaction:legacy:locations", "update", { shopId });

  const archivedLocationResult = await context.mutations.archiveLocation(context, input);
  return archivedLocationResult;
}
