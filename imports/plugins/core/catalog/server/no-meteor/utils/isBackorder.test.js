import { rewire as rewire$getProductQuantity, restore as restore$getProductQuantity } from "./getProductQuantity";
import isBackorder from "./isBackorder";

const mockGetProductQuantity = jest.fn().mockName("getProductQuantity");

// mock variant
const mockVariantWithBackorder = {
  inventoryManagement: true,
  inventoryPolicy: false,
  inventoryQuantity: 0
};

const mockVariantWithBackorderNotSoldOut = {
  inventoryManagement: true,
  inventoryPolicy: false,
  inventoryQuantity: 10
};

const mockVariantWithOutBackorder = {
  inventoryManagement: true,
  inventoryPolicy: true,
  inventoryQuantity: 0
};

const mockVariantWithOutInventory = {
  inventoryManagement: false,
  inventoryPolicy: false,
  inventoryQuantity: 0
};

beforeAll(() => {
  rewire$getProductQuantity(mockGetProductQuantity);
});

afterAll(restore$getProductQuantity);

test("expect true when a single product variant is sold out and has inventory policy disabled", () => {
  mockGetProductQuantity.mockReturnValueOnce(0);
  const spec = isBackorder([mockVariantWithBackorder]);
  expect(spec).toBe(true);
});

test("expect true when an array of product variants are sold out and have inventory policy disabled", () => {
  mockGetProductQuantity.mockReturnValueOnce(0).mockReturnValueOnce(0);
  const spec = isBackorder([mockVariantWithBackorder, mockVariantWithBackorder]);
  expect(spec).toBe(true);
});

test("expect false when an array of product variants has one sold out and another not sold out and both have inventory policy disabled", () => {
  mockGetProductQuantity.mockReturnValueOnce(10).mockReturnValueOnce(0);
  const spec = isBackorder([mockVariantWithBackorder, mockVariantWithBackorderNotSoldOut]);
  expect(spec).toBe(false);
});

test("expect false when a single product variant is not sold out and has inventory policy disabled", () => {
  mockGetProductQuantity.mockReturnValueOnce(10);
  const spec = isBackorder([mockVariantWithBackorderNotSoldOut]);
  expect(spec).toBe(false);
});

test("expect false when an array of product variants are not sold out and have inventory policy disabled", () => {
  mockGetProductQuantity.mockReturnValueOnce(10).mockReturnValueOnce(10);
  const spec = isBackorder([mockVariantWithBackorderNotSoldOut, mockVariantWithBackorderNotSoldOut]);
  expect(spec).toBe(false);
});

test("expect false when a single product variant is sold out and has inventory policy enabled", () => {
  mockGetProductQuantity.mockReturnValueOnce(0);
  const spec = isBackorder([mockVariantWithOutBackorder]);
  expect(spec).toBe(false);
});

test("expect false when a single product variant is sold out and has inventory controls disabled", () => {
  mockGetProductQuantity.mockReturnValueOnce(0);
  const spec = isBackorder([mockVariantWithOutInventory]);
  expect(spec).toBe(false);
});
