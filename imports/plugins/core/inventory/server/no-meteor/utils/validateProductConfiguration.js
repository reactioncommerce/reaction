/**
 * @summary Validates arbitrary object according to this schema:
 * {
 *   isSellable: Boolean,
 *   productId: String,
 *   productVariantId: String
 * }
 * @param {*} config - object to validate
 * @param {*} requireIsSellable - if true isSellable property is validated, otherwise optional
 * @param {*} errorPrefix - string to prefix every returned error message
 * @returns {Array} array of error messages
 */
export default function validateProductConfiguration(config, requireIsSellable = false, errorPrefix = "") {
  const requiredFields = ["productId", "productVariantId"];
  const errors = requiredFields.map((field) => !config[field] && `${errorPrefix}productConfigurationPropertyMissing[${field}]`);

  if (requireIsSellable && typeof config.isSellable !== "boolean") {
    errors.push(`${errorPrefix}productConfigurationProperyMustBeBoolean[isSellable]`);
  }
  return errors.filter(Boolean);
}
