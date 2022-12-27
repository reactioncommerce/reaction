/**
 * @name Query/introspectSchema
 * @method
 * @memberof SimpleSchema/GraphQL
 * @summary accept the input schema name and return JSON schema
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.shopId - ID of shop to query
 * @param {String} args.schemaName - input schema name
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} JSON schema object
 */
export default async function introspectSchema(_, args, context) {
  const { shopId, schemaName } = args;
  const returnJsonSchema = await context.queries.introspectSchema(context, { shopId, schemaName });
  return { schemaName, schema: returnJsonSchema };
}
