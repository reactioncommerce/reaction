/**
 * @name Query/globalSettings
 * @method
 * @memberof Core/GraphQL
 * @summary Gets global settings
 * @param {Object} _ - unused
 * @param {Object} __ - unused
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} The global settings object
 */
export default async function globalSettings(_, __, context) {
  return context.queries.appSettings(context);
}
