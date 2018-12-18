import isSoldOut from "./isSoldOut";

// mock variant
const mockVariantWithInventoryManagmentAndInventroy = {
  inventoryManagement: true,
  inventoryAvailableToSell: 1
};

const mockVariantWithInventoryManagmentAndNoInventroy = {
  inventoryManagement: true,
  inventoryAvailableToSell: 0
};

const mockVariantWithOutInventoryManagmentAndNoInventroy = {
  inventoryManagement: false,
  inventoryAvailableToSell: 0
};

test("expect true when a single product variant is sold out and inventory management is enabled", () => {
  const spec = isSoldOut([mockVariantWithInventoryManagmentAndNoInventroy]);
  expect(spec).toBe(true);
});

test("expect false when a single product variant is not sold out and inventory management is enabled", () => {
  const spec = isSoldOut([mockVariantWithInventoryManagmentAndInventroy]);
  expect(spec).toBe(false);
});

test("expect true when an array of product variants are sold out and inventory management is enabled", () => {
  const spec = isSoldOut([mockVariantWithInventoryManagmentAndNoInventroy, mockVariantWithInventoryManagmentAndNoInventroy]);
  expect(spec).toBe(true);
});

test("expect false when an array of product variants are not sold out and inventory management is enabled", () => {
  const spec = isSoldOut([mockVariantWithInventoryManagmentAndInventroy, mockVariantWithInventoryManagmentAndInventroy]);
  expect(spec).toBe(false);
});

test("expect false when an array of product variants has one sold out and one not sold out and inventory management is enabled", () => {
  const spec = isSoldOut([mockVariantWithInventoryManagmentAndInventroy, mockVariantWithInventoryManagmentAndNoInventroy]);
  expect(spec).toBe(false);
});

test("expect false when a single product variant is sold out and inventory management is disabled", () => {
  const spec = isSoldOut([mockVariantWithOutInventoryManagmentAndNoInventroy]);
  expect(spec).toBe(false);
});

test("expect false when one product variant has inventory management is disabled", () => {
  const spec = isSoldOut([mockVariantWithOutInventoryManagmentAndNoInventroy, mockVariantWithInventoryManagmentAndInventroy]);
  expect(spec).toBe(false);
});
