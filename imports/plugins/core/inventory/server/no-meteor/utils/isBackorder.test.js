import isBackorder from "./isBackorder";

// mock variant
const mockVariantWithBackorder = {
  inventoryManagement: true,
  inventoryPolicy: false,
  inventoryAvailableToSell: 0
};

const mockVariantWithBackorderNotSoldOut = {
  inventoryManagement: true,
  inventoryPolicy: false,
  inventoryAvailableToSell: 10
};

const mockVariantWithOutBackorder = {
  inventoryManagement: true,
  inventoryPolicy: true,
  inventoryAvailableToSell: 0
};

const mockVariantWithOutInventory = {
  inventoryManagement: false,
  inventoryPolicy: false,
  inventoryAvailableToSell: 0
};

test("expect true when a single product variant is sold out and has inventory policy disabled", () => {
  const spec = isBackorder([mockVariantWithBackorder]);
  expect(spec).toBe(true);
});

test("expect true when an array of product variants are sold out and have inventory policy disabled", () => {
  const spec = isBackorder([mockVariantWithBackorder, mockVariantWithBackorder]);
  expect(spec).toBe(true);
});

test("expect false when an array of product variants has one sold out and another not sold out and both have inventory policy disabled", () => {
  const spec = isBackorder([mockVariantWithBackorder, mockVariantWithBackorderNotSoldOut]);
  expect(spec).toBe(false);
});

test("expect false when a single product variant is not sold out and has inventory policy disabled", () => {
  const spec = isBackorder([mockVariantWithBackorderNotSoldOut]);
  expect(spec).toBe(false);
});

test("expect false when an array of product variants are not sold out and have inventory policy disabled", () => {
  const spec = isBackorder([mockVariantWithBackorderNotSoldOut, mockVariantWithBackorderNotSoldOut]);
  expect(spec).toBe(false);
});

test("expect false when a single product variant is sold out and has inventory policy enabled", () => {
  const spec = isBackorder([mockVariantWithOutBackorder]);
  expect(spec).toBe(false);
});

test("expect false when a single product variant is sold out and has inventory controls disabled", () => {
  const spec = isBackorder([mockVariantWithOutInventory]);
  expect(spec).toBe(false);
});
