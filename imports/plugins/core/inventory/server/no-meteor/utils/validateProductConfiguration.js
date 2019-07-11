export default function validateProductConfiguration(config, requireIsSellable = false, errorPrefix = "") {
  const requiredFields = ["productId", "productVariantId"];
  const errors = requiredFields.map((field) => !config[field] && `${errorPrefix}productConfigurationPropertyMissing[${field}]`);

  if (requireIsSellable && typeof config.isSellable !== "boolean") {
    errors.push(`${errorPrefix}productConfigurationProperyMustBeBoolean[isSellable]`);
  }
  return errors.filter(Boolean);
}
