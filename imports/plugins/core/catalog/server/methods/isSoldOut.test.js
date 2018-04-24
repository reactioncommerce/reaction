import {
  rewire as rewire$ProductRevision,
  restore as restore$ProductRevision
} from "/imports/plugins/core/revisions/server/no-meteor/ProductRevision";
import isSoldOut from "./isSoldOut";

const mockProductRevision = {
  getVariantQuantity: jest.fn().mockName("ProductRevision.getVariantQuantity")
};

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
  rewire$ProductRevision(mockProductRevision);
});

afterAll(restore$ProductRevision);

test("expect true when a single product variant is sold out and inventory management is enabled", async () => {
  mockProductRevision.getVariantQuantity.mockReturnValueOnce(Promise.resolve(0));
  const spec = await isSoldOut([mockVariantWithInventoryManagment], mockCollections);
  expect(spec).toBe(true);
});

test("expect false when a single product variant is not sold out and inventory management is enabled", async () => {
  mockProductRevision.getVariantQuantity.mockReturnValueOnce(Promise.resolve(1));
  const spec = await isSoldOut([mockVariantWithInventoryManagment], mockCollections);
  expect(spec).toBe(false);
});

test("expect true when an array of product variants are sold out and inventory management is enabled", async () => {
  mockProductRevision.getVariantQuantity
    .mockReturnValueOnce(Promise.resolve(0))
    .mockReturnValueOnce(Promise.resolve(0));
  const spec = await isSoldOut([mockVariantWithInventoryManagment, mockVariantWithInventoryManagment], mockCollections);
  expect(spec).toBe(true);
});

test("expect false when an array of product variants are not sold out and inventory management is enabled", async () => {
  mockProductRevision.getVariantQuantity
    .mockReturnValueOnce(Promise.resolve(1))
    .mockReturnValueOnce(Promise.resolve(1));
  const spec = await isSoldOut([mockVariantWithInventoryManagment, mockVariantWithInventoryManagment], mockCollections);
  expect(spec).toBe(false);
});

test("expect false when an array of product variants has one sold out and one not sold out and inventory management is enabled", async () => {
  mockProductRevision.getVariantQuantity
    .mockReturnValueOnce(Promise.resolve(0))
    .mockReturnValueOnce(Promise.resolve(1));
  const spec = await isSoldOut([mockVariantWithInventoryManagment, mockVariantWithInventoryManagment], mockCollections);
  expect(spec).toBe(false);
});

test("expect false when a single product variant is sold out and inventory management is disabled", async () => {
  mockProductRevision.getVariantQuantity.mockReturnValueOnce(Promise.resolve(0));
  const spec = await isSoldOut([mockVariantWithOutInventoryManagment], mockCollections);
  expect(spec).toBe(false);
});

test("expect false when one product variant has inventory management is disabled", async () => {
  mockProductRevision.getVariantQuantity.mockReturnValueOnce(Promise.resolve(0));
  const spec = await isSoldOut(
    [mockVariantWithOutInventoryManagment, mockVariantWithInventoryManagment],
    mockCollections
  );
  expect(spec).toBe(false);
});
