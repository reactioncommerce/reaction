/**
 * @name Mutation/updateGlobalSettings
 * @method
 * @memberof Shop/GraphQL
 * @summary resolver for the updateGlobalSettings GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args - an object of all mutation arguments that were sent by the client
 * @param {Object} args.input - mutation input object
 * @param {String} args.input.shopId - Shop ID
 * @param {Object} args.input.settingsUpdates - Updated fields
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} ShopsPayload
 */
export default async function updateGlobalSettings(_, { input }, context) {
  const {
    settingsUpdates,
    clientMutationId = null
  } = input;

  const globalSettings = await context.mutations.updateAppSettings(context, settingsUpdates, null);

  return {
    clientMutationId,
    globalSettings
  };
}
