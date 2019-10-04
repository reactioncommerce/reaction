import validateInventoryInfo from "./validateInventoryInfo.js";
import validateProductConfiguration from "./validateProductConfiguration.js";

/**
 * @summary Validate an array of objects according to this schema:
 * {
 *  inventoryInfo: {
 *    canBackorder: Boolean,
 *    inventoryAvailableToSell: {
 *      type: Integer,
 *      min: 0
 *    },
 *    inventoryInStock: {
 *      type: Integer,
 *      min: 0
 *    },
 *    inventoryReserved: {
 *      type: Integer,
 *      min: 0
 *    },
 *    isLowQuantity: Boolean
 *    optional: true
 *  },
 *  productConfiguration: {
 *    productId: String,
 *    productVariantId: String
 *  }
 * }
 * @param {Object[]} results - array of objects to validate
 * @returns {Array} array of error messages
 */
export default function validateInventoryPluginResults(results) {
  return results.map((result, index) => {
    if (!result.productConfiguration) {
      return [`[${index}].inventoryPluginResultMissingField[productConfiguration]`];
    }
    let errors = validateProductConfiguration(result.productConfiguration, false, `[${index}].`);
    if (result.inventoryInfo) {
      errors = [...errors, ...validateInventoryInfo(result.inventoryInfo, `[${index}].`)];
    }
    return errors;
  }).reduce((flat, toFlatten) => flat.concat(toFlatten), []);
}
