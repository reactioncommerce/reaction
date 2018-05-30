import mockContext from "/imports/test-utils/helpers/mockContext";
import { rewire as rewire$getProduct, restore as restore$getProduct } from "./getProduct";
import { rewire as rewire$getVariants, restore as restore$getVariants } from "./getVariants";
import getVariantPriceRange from "./getVariantPriceRange";

const mockCollections = { ...mockContext.collections };
const mockGetProduct = jest.fn().mockName("getProducts");
const mockGetVariants = jest.fn().mockName("getVariants");

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
    inventoryManagement: true,
    inventoryPolicy: false,
    isLowQuantity: true,
    isSoldOut: false,
    isDeleted: false,
    isVisible: true,
    length: 0,
    lowInventoryWarningThreshold: 0,
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
    price: 2.99,
    shopId: internalShopId,
    sku: "sku",
    taxable: true,
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
    inventoryManagement: true,
    inventoryPolicy: true,
    isLowQuantity: true,
    isSoldOut: false,
    isDeleted: false,
    isVisible: true,
    length: 2,
    lowInventoryWarningThreshold: 0,
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
    price: 5.99,
    shopId: internalShopId,
    sku: "sku",
    taxable: true,
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "One pound bag",
    variantId: internalVariantIds[1],
    weight: 2,
    width: 2
  }
];

beforeAll(() => {
  rewire$getProduct(mockGetProduct);
  rewire$getVariants(mockGetVariants);
});

afterAll(() => {
  restore$getProduct();
  restore$getVariants();
});

// expect topVariant price if no children
test("expect topVariants price string if no child variants", async () => {
  mockGetVariants.mockReturnValueOnce(Promise.resolve([{ isDeleted: true }]));
  mockGetProduct.mockReturnValueOnce(Promise.resolve(mockVariants[0]));
  const spec = await getVariantPriceRange(internalVariantIds[0], mockCollections);
  const success = {
    range: "2.99",
    max: 2.99,
    min: 2.99
  };
  expect(spec).toEqual(success);
});

// expect child variant price if only one child variant
test("expect child variant price string if only one child variant", async () => {
  mockGetVariants.mockReturnValueOnce(Promise.resolve([mockVariants[1]]));
  const spec = await getVariantPriceRange(internalVariantIds[0], mockCollections);
  const success = {
    range: "5.99",
    max: 5.99,
    min: 5.99
  };
  expect(spec).toEqual(success);
});

// expect a price rang string of the min price and max price
test("expect price range string if variants have different prices", async () => {
  mockGetVariants.mockReturnValueOnce(Promise.resolve(mockVariants));
  const spec = await getVariantPriceRange(internalVariantIds[0], mockCollections);
  const success = {
    range: "2.99 - 5.99",
    max: 5.99,
    min: 2.99
  };
  expect(spec).toEqual(success);
});

// expect variant min price if min and max price are equal
test("expect variant price string if variants have same price", async () => {
  mockVariants[1].price = 2.99;
  mockGetVariants.mockReturnValueOnce(Promise.resolve(mockVariants));
  const spec = await getVariantPriceRange(internalVariantIds[0], mockCollections);
  const success = {
    range: "2.99",
    max: 2.99,
    min: 2.99
  };
  expect(spec).toEqual(success);
});
