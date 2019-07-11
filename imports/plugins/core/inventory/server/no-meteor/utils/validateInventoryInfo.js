export default function validateInventoryInfo(info, errorPrefix = "") {
  const booleans = ["canBackorder", "isLowQuantity"];
  const integers = ["inventoryAvailableToSell", "inventoryInStock", "inventoryReserved"];

  const errors = [
    ...booleans.map((field) => (typeof info[field] !== "boolean") && `${errorPrefix}inventoryInfoFieldIsNotBoolean[${field}]`),
    ...integers.map((field) => (typeof info[field] !== "number" || info[field] < 0) && `${errorPrefix}inventoryInfoFieldIsNotNumber[${field}]`)
  ];
  return errors.filter(Boolean);
}
