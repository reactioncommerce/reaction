import isLowQuantity from "./isLowQuantity";

// mock variant
const mockVariantWithInventoryManagmentWithoutLowQuantity = {
  inventoryManagement: true,
  inventoryPolicy: true,
  lowInventoryWarningThreshold: 5,
  inventoryAvailableToSell: 10
};

const mockVariantWithInventoryManagmentWithLowQuantity = {
  inventoryManagement: true,
  inventoryPolicy: true,
  lowInventoryWarningThreshold: 5,
  inventoryAvailableToSell: 4
};

const mockVariantWithOutInventoryManagment = {
  inventoryManagement: false,
  inventoryPolicy: false,
  lowInventoryWarningThreshold: 10,
  inventoryAvailableToSell: 5
};

test("expect true when a single product variant has a low quantity and inventory controls are enabled", () => {
  const spec = isLowQuantity([mockVariantWithInventoryManagmentWithLowQuantity]);
  expect(spec).toBe(true);
});

test("expect true when an array of product variants each have a low quantity and inventory controls are enabled", () => {
  const spec = isLowQuantity([mockVariantWithInventoryManagmentWithLowQuantity, mockVariantWithInventoryManagmentWithLowQuantity]);
  expect(spec).toBe(true);
});

test("expect false when a single product variant does not have a low quantity and inventory controls are enabled", () => {
  const spec = isLowQuantity([mockVariantWithInventoryManagmentWithoutLowQuantity]);
  expect(spec).toBe(false);
});

test("expect false when an array of product variants each do not have a low quantity and inventory controls are enabled", () => {
  const spec = isLowQuantity([mockVariantWithInventoryManagmentWithoutLowQuantity, mockVariantWithInventoryManagmentWithoutLowQuantity]);
  expect(spec).toBe(false);
});

test("expect false when a single product variant has a low quantity and inventory controls are disabled", () => {
  const spec = isLowQuantity([mockVariantWithOutInventoryManagment]);
  expect(spec).toBe(false);
});

test("expect false when an array of product variants each have a low quantity and inventory controls are disabled", () => {
  const spec = isLowQuantity([mockVariantWithOutInventoryManagment, mockVariantWithOutInventoryManagment]);
  expect(spec).toBe(false);
});
