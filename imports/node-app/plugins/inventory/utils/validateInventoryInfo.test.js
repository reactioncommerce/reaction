import validateInventoryInfo from "./validateInventoryInfo.js";

test("returns correct errors when payload is not valid", () => {
  const errors = validateInventoryInfo({});
  expect(errors).toEqual([
    "inventoryInfoFieldIsNotBoolean[canBackorder]",
    "inventoryInfoFieldIsNotBoolean[isLowQuantity]",
    "inventoryInfoFieldIsNotNumber[inventoryAvailableToSell]",
    "inventoryInfoFieldIsNotNumber[inventoryInStock]",
    "inventoryInfoFieldIsNotNumber[inventoryReserved]"
  ]);
});

test("returns empty array when payload is valid", () => {
  const errors = validateInventoryInfo({
    canBackorder: true,
    isLowQuantity: false,
    inventoryAvailableToSell: 2,
    inventoryInStock: 2,
    inventoryReserved: 0
  });
  expect(errors).toEqual([]);
});

test("returns errors for number fields with negative values", () => {
  const errors = validateInventoryInfo({
    canBackorder: true,
    isLowQuantity: false,
    inventoryAvailableToSell: -1,
    inventoryInStock: 2,
    inventoryReserved: 0
  });
  expect(errors).toEqual([
    "inventoryInfoFieldIsNotNumber[inventoryAvailableToSell]"
  ]);
});
