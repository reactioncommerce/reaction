import { rewire as rewire$getVariantPriceRange, restore as restore$getVariantPriceRange } from "./getVariantPriceRange.js";
import getProductPriceRange from "./getProductPriceRange.js";

const mockGetVariantPriceRange = jest.fn().mockName("getVariantPriceRange");

const internalShopId = "123";
const internalCatalogProductId = "999";
const internalVariantIds = ["875", "874"];

const createdAt = new Date("2018-04-16T15:34:28.043Z");
const updatedAt = new Date("2018-04-17T15:34:28.043Z");

const mockVariants = [
  {
    _id: internalVariantIds[0],
    ancestors: [internalCatalogProductId],
    barcode: "barcode",
    createdAt,
    height: 0,
    index: 0,
    isDeleted: false,
    isVisible: true,
    length: 0,
    metafields: [
      {
        value: "value",
        namespace: "namespace",
        description: "description",
        valueType: "valueType",
        scope: "scope",
        key: "key"
      }
    ],
    minOrderQuantity: 0,
    optionTitle: "Untitled Option",
    originCountry: "US",
    price: 0,
    shopId: internalShopId,
    sku: "sku",
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "Small Concrete Pizza",
    updatedAt,
    variantId: internalVariantIds[0],
    weight: 0,
    width: 0
  },
  {
    _id: internalVariantIds[1],
    ancestors: [internalCatalogProductId, internalVariantIds[0]],
    barcode: "barcode",
    height: 2,
    index: 0,
    isDeleted: false,
    isVisible: true,
    length: 2,
    metafields: [
      {
        value: "value",
        namespace: "namespace",
        description: "description",
        valueType: "valueType",
        scope: "scope",
        key: "key"
      }
    ],
    minOrderQuantity: 0,
    optionTitle: "Awesome Soft Bike",
    originCountry: "US",
    price: 2.99,
    shopId: internalShopId,
    sku: "sku",
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "One pound bag",
    variantId: internalVariantIds[1],
    weight: 2,
    width: 2
  }
];

const mockPriceRange = {
  range: "2.99 - 5.99",
  max: 5.99,
  min: 2.99
};

beforeAll(() => {
  rewire$getVariantPriceRange(mockGetVariantPriceRange);
});

afterAll(() => {
  restore$getVariantPriceRange();
});

// expect a legit price range
test("expect to return a promise that resolves to a product price object", () => {
  mockGetVariantPriceRange
    .mockReturnValueOnce(mockPriceRange)
    .mockReturnValueOnce(mockPriceRange);
  const spec = getProductPriceRange("999", mockVariants);
  expect(spec).toEqual(mockPriceRange);
});

// expect an empty price range
test("expect to throw an error if no product is found", () => {
  try {
    getProductPriceRange("badID", mockVariants);
  } catch (error) {
    expect(error).toEqual("Product not found");
  }
});
