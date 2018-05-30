import getProductQuantity from "./getProductQuantity";

const mockProductId = "999";
const mockVariantId = "123";
const mockOptionIds = ["234", "345"];

const mockVariant = {
  _id: mockVariantId,
  ancestors: [mockProductId],
  inventoryQuantity: 5
};

const mockOptions = [
  {
    _id: mockOptionIds[0],
    ancestors: [mockProductId, mockVariantId],
    inventoryQuantity: 6
  },
  {
    _id: mockOptionIds[1],
    ancestors: [mockProductId, mockVariantId],
    inventoryQuantity: 4
  }
];

test("expect the variant quantity number when only a single variant param", () => {
  const spec = getProductQuantity(mockVariant);
  expect(spec).toEqual(5);
});

test("expect the option quantity number when only a single option param", () => {
  const spec = getProductQuantity(mockVariant, [mockOptions[0]]);
  expect(spec).toEqual(6);
});

test("expect the sum of all option quantity numbers when multiple options", () => {
  const spec = getProductQuantity(mockVariant, mockOptions);
  expect(spec).toEqual(10);
});

test("expect the 0 when options have no inventory", () => {
  mockOptions[0].inventoryQuantity = 0;
  mockOptions[1].inventoryQuantity = 0;
  const spec = getProductQuantity(mockVariant, mockOptions);
  expect(spec).toEqual(0);
});

test("expect the 0 when no inventory and no options", () => {
  mockVariant.inventoryQuantity = 0;
  const spec = getProductQuantity(mockVariant);
  expect(spec).toEqual(0);
});
