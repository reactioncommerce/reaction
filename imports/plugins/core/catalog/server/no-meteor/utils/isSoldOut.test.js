import { rewire as rewire$getProductQuantity, restore as restore$getProductQuantity } from "./getProductQuantity";
import isSoldOut from "./isSoldOut";

const mockGetProductQuantity = jest.fn().mockName("getProductQuantity");

// mock collections
const mockCollections = {};

// mock variant
const mockVariantWithInventoryManagment = {
  inventoryManagement: true
};

const mockVariantWithOutInventoryManagment = {
  inventoryManagement: false
};

beforeAll(() => {
  rewire$getProductQuantity(mockGetProductQuantity);
});

afterAll(restore$getProductQuantity);

test("expect true when a single product variant is sold out and inventory management is enabled", () => {
  mockGetProductQuantity.mockReturnValueOnce(0);
  const spec = isSoldOut([mockVariantWithInventoryManagment], mockCollections);
  expect(spec).toBe(true);
});

test("expect false when a single product variant is not sold out and inventory management is enabled", () => {
  mockGetProductQuantity.mockReturnValueOnce(1);
  const spec = isSoldOut([mockVariantWithInventoryManagment], mockCollections);
  expect(spec).toBe(false);
});

test("expect true when an array of product variants are sold out and inventory management is enabled", () => {
  mockGetProductQuantity.mockReturnValueOnce(0).mockReturnValueOnce(0);
  const spec = isSoldOut([mockVariantWithInventoryManagment, mockVariantWithInventoryManagment], mockCollections);
  expect(spec).toBe(true);
});

test("expect false when an array of product variants are not sold out and inventory management is enabled", () => {
  mockGetProductQuantity.mockReturnValueOnce(1).mockReturnValueOnce(1);
  const spec = isSoldOut([mockVariantWithInventoryManagment, mockVariantWithInventoryManagment], mockCollections);
  expect(spec).toBe(false);
});

test("expect false when an array of product variants has one sold out and one not sold out and inventory management is enabled", () => {
  mockGetProductQuantity.mockReturnValueOnce(0).mockReturnValueOnce(1);
  const spec = isSoldOut([mockVariantWithInventoryManagment, mockVariantWithInventoryManagment], mockCollections);
  expect(spec).toBe(false);
});

test("expect false when a single product variant is sold out and inventory management is disabled", () => {
  mockGetProductQuantity.mockReturnValueOnce(0);
  const spec = isSoldOut([mockVariantWithOutInventoryManagment], mockCollections);
  expect(spec).toBe(false);
});

test("expect false when one product variant has inventory management is disabled", () => {
  mockGetProductQuantity.mockReturnValueOnce(0);
  const spec = isSoldOut([mockVariantWithOutInventoryManagment, mockVariantWithInventoryManagment], mockCollections);
  expect(spec).toBe(false);
});
