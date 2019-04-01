/**
 * @name Query.systemInformation
 * @method
 * @memberof SystemInformation/GraphQL
 * @summary get system information for reaction site
 * @param {Object} context - an object containing the per-request state
 * @return {<Object>} System Information Object
 */
export default async function systemInformation() {
  return context.queries.systemInformation();
}
