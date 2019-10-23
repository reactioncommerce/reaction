import validateProductConfiguration from "./validateProductConfiguration.js";

const ALL_FIELDS = [
  "canBackorder",
  "inventoryAvailableToSell",
  "inventoryInStock",
  "inventoryReserved",
  "isBackorder",
  "isLowQuantity",
  "isSoldOut"
];

/**
 * @summary Validates an arbitrary object according to this schema:
 * {
 *   "fields": {
 *     type: Array,
 *     optional: true
 *   },
 *   "fields.$": {
 *     type: String,
 *     allowedValues: [
 *       "canBackorder",
 *       "inventoryAvailableToSell",
 *       "inventoryInStock",
 *       "inventoryReserved",
 *       "isBackorder",
 *       "isLowQuantity",
 *       "isSoldOut"
 *     ]
 *   },
 *   "productConfigurations": Array,
 *   "productConfigurations.$": {
 *     isSellable: Boolean,
 *     productId: String,
 *     productVariantId: String
 *   },
 *   "shopId": String
 * }
 * @param {Object} input - an object to validate
 * @returns {Array} array of error messages
 */
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
