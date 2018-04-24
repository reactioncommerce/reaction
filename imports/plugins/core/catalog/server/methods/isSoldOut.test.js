import {
  rewire as rewire$ProductRevision,
  restore as restore$ProductRevision
} from "/imports/plugins/core/revisions/server/no-meteor/ProductRevision";
import isSoldOut from "./isSoldOut";

const mockProductRevision = {
  getVariantQuantity: jest.fn().mockName("ProductRevision.getVariantQuantity")
};

beforeAll(() => {
  rewire$ProductRevision(mockProductRevision);
});

afterAll(restore$ProductRevision);

// mock collections
const mockCollections = {};

// mock variant
const mockVariant = {
  inventoryManagement: true
};

test("expect true when product variant is sold out", async () => {
  mockProductRevision.getVariantQuantity.mockReturnValueOnce(Promise.resolve(0));
  const spec = await isSoldOut([mockVariant], mockCollections);
  expect(spec).toBe(true);
});

test("expect false when product variant is not sold out", async () => {
  mockProductRevision.getVariantQuantity.mockReturnValueOnce(Promise.resolve(1));
  const spec = await isSoldOut([mockVariant], mockCollections);
  expect(spec).toBe(false);
});
