import _ from "lodash";

/**
 * @summary Get the get the custom field of the cart item
 * @param {Object} context - The application context
 * @param {Object} params - The parameters to pass to the fact
 * @param {Object} almanac - The almanac to pass to the fact
 * @returns {Promise<string>} - The total amount of a discount or promotion
 */
export default async function getKeyValueArray(context, params, almanac) {
  const item = await almanac.factValue("item");
  const { inputField = "key", inputValue = "name", outputField = "value", fieldName } = params.ruleParams || {};
  const result = _.find(item[fieldName] || [], { [inputField]: inputValue });
  return result && result[outputField] ? result[outputField] : "";
}
