import validateProductConfiguration from "./validateProductConfiguration";

const ALL_FIELDS = [
  "canBackorder",
  "inventoryAvailableToSell",
  "inventoryInStock",
  "inventoryReserved",
  "isBackorder",
  "isLowQuantity",
  "isSoldOut"
];

export default function validateInventoryInput(input) {
  let errors = [];
  const allFieldsLookup = ALL_FIELDS.reduce((allFields, field) => ({ ...allFields, [field]: true }), {});
  const { fields, shopId, productConfigurations } = input;
  if (!shopId) {
    errors.push("inventoryInputMissingField[shopId]");
  }
  if (productConfigurations && productConfigurations.length) {
    const productConfigurationErrors = productConfigurations.map((pc, index) => validateProductConfiguration(pc, true, `[${index}].`));
    errors = [...errors, ...productConfigurationErrors.reduce((flat, toFlatten) => flat.concat(toFlatten), [])];
  } else {
    errors.push("inventoryInputInvalidPropertyValue[productConfigurations]");
  }
  if (fields && fields.length) {
    errors = [...errors, ...fields.map((field) => !allFieldsLookup[field] && `inventoryInputInvalidFieldsPropertyValue[${field}]`)];
  }
  return errors.filter(Boolean);
}
