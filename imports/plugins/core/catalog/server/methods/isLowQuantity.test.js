import {
  rewire as rewire$ProductRevision,
  restore as restore$ProductRevision
} from "/imports/plugins/core/revisions/server/no-meteor/ProductRevision";
import isLowQuantity from "./isLowQuantity";

const mockProductRevision = {
  getVariantQuantity: jest.fn().mockName("ProductRevision.getVariantQuantity")
};

// mock collections
const mockCollections = {};

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
  rewire$ProductRevision(mockProductRevision);
});

afterAll(restore$ProductRevision);

test("expect true when a single product variant has a low quantity and inventory controls are enabled", async () => {
  mockProductRevision.getVariantQuantity.mockReturnValueOnce(Promise.resolve(2));
  const spec = await isLowQuantity([mockVariantWithInventoryManagment], mockCollections);
  expect(spec).toBe(true);
});

test("expect true when an array of product variants each have a low quantity and inventory controls are enabled", async () => {
  mockProductRevision.getVariantQuantity
    .mockReturnValueOnce(Promise.resolve(2))
    .mockReturnValueOnce(Promise.resolve(2));
  const spec = await isLowQuantity(
    [mockVariantWithInventoryManagment, mockVariantWithInventoryManagment],
    mockCollections
  );
  expect(spec).toBe(true);
});

test("expect false when a single product variant does not have a low quantity and inventory controls are enabled", async () => {
  mockProductRevision.getVariantQuantity.mockReturnValueOnce(Promise.resolve(10));
  const spec = await isLowQuantity([mockVariantWithInventoryManagment], mockCollections);
  expect(spec).toBe(false);
});

test("expect false when an array of product variants each do not have a low quantity and inventory controls are enabled", async () => {
  mockProductRevision.getVariantQuantity
    .mockReturnValueOnce(Promise.resolve(10))
    .mockReturnValueOnce(Promise.resolve(10));
  const spec = await isLowQuantity(
    [mockVariantWithInventoryManagment, mockVariantWithInventoryManagment],
    mockCollections
  );
  expect(spec).toBe(false);
});

test("expect false when a single product variant has a low quantity and inventory controls are disabled", async () => {
  mockProductRevision.getVariantQuantity.mockReturnValueOnce(Promise.resolve(2));
  const spec = await isLowQuantity([mockVariantWithOutInventoryManagment], mockCollections);
  expect(spec).toBe(false);
});

test("expect false when an array of product variants each have a low quantity and inventory controls are disabled", async () => {
  mockProductRevision.getVariantQuantity
    .mockReturnValueOnce(Promise.resolve(2))
    .mockReturnValueOnce(Promise.resolve(2));
  const spec = await isLowQuantity(
    [mockVariantWithOutInventoryManagment, mockVariantWithOutInventoryManagment],
    mockCollections
  );
  expect(spec).toBe(false);
});
