import canBackorder from "./canBackorder";

// mock variant
const mockVariantWithBackorder = {
  inventoryManagement: true,
  inventoryPolicy: false
};

const mockVariantWithOutBackorder = {
  inventoryManagement: true,
  inventoryPolicy: true
};

const mockVariantWithOutInventory = {
  inventoryManagement: false,
  inventoryPolicy: false
};


test("expect true when a single product variant is sold out and has inventory policy disabled", () => {
  const spec = canBackorder([mockVariantWithBackorder]);
  expect(spec).toBe(true);
});

test("expect true when an array of product variants are sold out and have inventory policy disabled", () => {
  const spec = canBackorder([mockVariantWithBackorder, mockVariantWithBackorder]);
  expect(spec).toBe(true);
});

test("expect false when a single product variant is sold out and has inventory policy enabled", () => {
  const spec = canBackorder([mockVariantWithOutBackorder]);
  expect(spec).toBe(false);
});

test("expect false when a single product variant is sold out and has inventory controls disabled", () => {
  const spec = canBackorder([mockVariantWithOutInventory]);
  expect(spec).toBe(false);
});
