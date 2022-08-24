/**
 * @summary Validates the object passed in according to this schema:
 * {
 *  canBackorder: Boolean,
 *  inventoryAvailableToSell: {
 *    type: Integer,
 *    min: 0
 *  },
 *  inventoryInStock: {
 *    type: Integer,
 *    min: 0
 *  },
 *  inventoryReserved: {
 *    type: Integer,
 *    min: 0
 *  },
 *  isLowQuantity: Boolean
 * }
 * @param {Object} info - inventory info
 * @param {String} errorPrefix - string to prefix every returned error message
 * @returns {Array} array of error messages
 */
export default function validateInventoryInfo(info, errorPrefix = "") {
  const booleans = ["canBackorder", "isLowQuantity"];
  const integers = ["inventoryAvailableToSell", "inventoryInStock", "inventoryReserved"];

  const errors = [
    ...booleans.map((field) => (typeof info[field] !== "boolean") && `${errorPrefix}inventoryInfoFieldIsNotBoolean[${field}]`),
    ...integers.map((field) => (typeof info[field] !== "number" || info[field] < 0) && `${errorPrefix}inventoryInfoFieldIsNotNumber[${field}]`)
  ];
  return errors.filter(Boolean);
}
