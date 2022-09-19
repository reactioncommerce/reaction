/**
 * @method getCustomFields
 * @summary Returns the CustomFields
 * @param {Object} context - an object containing the per-request state
 * @param {Object} customFieldsFromClient - customFieldsFromClient
 * @param {Object} order - orderobject
 * @returns {Object[]} customFields
 */
export default async function getCustomFields(context, customFieldsFromClient, order) {
  const { getFunctionsOfType } = context;

  // Apply custom order data transformations from plugins
  const transformCustomOrderFieldsFuncs = getFunctionsOfType("transformCustomOrderFields");
  let customFields = { ...(customFieldsFromClient || {}) };
  if (transformCustomOrderFieldsFuncs.length > 0) {
    // We need to run each of these functions in a series, rather than in parallel, because
    // each function expects to get the result of the previous. It is recommended to disable `no-await-in-loop`
    // eslint rules when the output of one iteration might be used as input in another iteration, such as this case here.
    // See https://eslint.org/docs/rules/no-await-in-loop#when-not-to-use-it
    for (const transformCustomOrderFieldsFunc of transformCustomOrderFieldsFuncs) {
      customFields = await transformCustomOrderFieldsFunc({ context, customFields, order }); // eslint-disable-line no-await-in-loop
    }
  }
  return customFields;
}
