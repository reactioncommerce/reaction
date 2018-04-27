import {
  rewire as rewire$getVariantQuantity,
  restore as restore$getVariantQuantity
} from "/imports/plugins/core/revisions/server/no-meteor/getVariantQuantity";
import isBackorder from "./isBackorder";

const mockGetVariantQuantity = jest.fn().mockName("ProductRevision.getVariantQuantity");

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
  rewire$getVariantQuantity(mockGetVariantQuantity);
});

afterAll(restore$getVariantQuantity);

test("expect true when a single product vartiant is sold out and has inventory policy disabled", async () => {
  mockGetVariantQuantity.mockReturnValueOnce(Promise.resolve(0));
  const spec = await isBackorder([mockVariantWithBackorder]);
  expect(spec).toBe(true);
});

test("expect true when an array of product vartiants are sold out and have inventory policy disabled", async () => {
  mockGetVariantQuantity.mockReturnValueOnce(Promise.resolve(0)).mockReturnValueOnce(Promise.resolve(0));
  const spec = await isBackorder([mockVariantWithBackorder, mockVariantWithBackorder]);
  expect(spec).toBe(true);
});

test("expect false when an array of product vartiants has one sold out and another not sold out and both have inventory policy disabled", async () => {
  mockGetVariantQuantity.mockReturnValueOnce(Promise.resolve(10)).mockReturnValueOnce(Promise.resolve(0));
  const spec = await isBackorder([mockVariantWithBackorder, mockVariantWithBackorderNotSoldOut]);
  expect(spec).toBe(false);
});

test("expect false when a single product vartiant is not sold out and has inventory policy disabled", async () => {
  mockGetVariantQuantity.mockReturnValueOnce(Promise.resolve(10));
  const spec = await isBackorder([mockVariantWithBackorderNotSoldOut]);
  expect(spec).toBe(false);
});

test("expect false when an array of product vartiants are not sold out and have inventory policy disabled", async () => {
  mockGetVariantQuantity.mockReturnValueOnce(Promise.resolve(10)).mockReturnValueOnce(Promise.resolve(10));
  const spec = await isBackorder([mockVariantWithBackorderNotSoldOut, mockVariantWithBackorderNotSoldOut]);
  expect(spec).toBe(false);
});

test("expect false when a single product vartiant is sold out and has inventory policy enabled", async () => {
  mockGetVariantQuantity.mockReturnValueOnce(Promise.resolve(0));
  const spec = await isBackorder([mockVariantWithOutBackorder]);
  expect(spec).toBe(false);
});

test("expect false when a single product vartiant is sold out and has inventory controls disabled", async () => {
  mockGetVariantQuantity.mockReturnValueOnce(Promise.resolve(0));
  const spec = await isBackorder([mockVariantWithOutInventory]);
  expect(spec).toBe(false);
});
