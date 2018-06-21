import { rewire as rewire$getProductQuantity, restore as restore$getProductQuantity } from "./getProductQuantity";
import isLowQuantity from "./isLowQuantity";

const mockGetProductQuantity = jest.fn().mockName("getProductQuantity");

// mock variant
const mockVariantWithInventoryManagment = {
  inventoryManagement: true,
  inventoryPolicy: true,
  lowInventoryWarningThreshold: 5
};

const mockVariantWithOutInventoryManagment = {
  inventoryManagement: false,
  inventoryPolicy: false,
  lowInventoryWarningThreshold: 0
};

beforeAll(() => {
  rewire$getProductQuantity(mockGetProductQuantity);
});

afterAll(restore$getProductQuantity);

test("expect true when a single product variant has a low quantity and inventory controls are enabled", () => {
  mockGetProductQuantity.mockReturnValueOnce(2);
  const spec = isLowQuantity([mockVariantWithInventoryManagment]);
  expect(spec).toBe(true);
});

test("expect true when an array of product variants each have a low quantity and inventory controls are enabled", () => {
  mockGetProductQuantity.mockReturnValueOnce(2).mockReturnValueOnce(2);
  const spec = isLowQuantity([mockVariantWithInventoryManagment, mockVariantWithInventoryManagment]);
  expect(spec).toBe(true);
});

test("expect false when a single product variant does not have a low quantity and inventory controls are enabled", () => {
  mockGetProductQuantity.mockReturnValueOnce(10);
  const spec = isLowQuantity([mockVariantWithInventoryManagment]);
  expect(spec).toBe(false);
});

test("expect false when an array of product variants each do not have a low quantity and inventory controls are enabled", () => {
  mockGetProductQuantity.mockReturnValueOnce(10).mockReturnValueOnce(10);
  const spec = isLowQuantity([mockVariantWithInventoryManagment, mockVariantWithInventoryManagment]);
  expect(spec).toBe(false);
});

test("expect false when a single product variant has a low quantity and inventory controls are disabled", () => {
  mockGetProductQuantity.mockReturnValueOnce(2);
  const spec = isLowQuantity([mockVariantWithOutInventoryManagment]);
  expect(spec).toBe(false);
});

test("expect false when an array of product variants each have a low quantity and inventory controls are disabled", () => {
  mockGetProductQuantity.mockReturnValueOnce(2).mockReturnValueOnce(2);
  const spec = isLowQuantity([mockVariantWithOutInventoryManagment, mockVariantWithOutInventoryManagment]);
  expect(spec).toBe(false);
});
