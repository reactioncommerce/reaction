import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import hasChildVariant from "./hasChildVariant.js";

const mockCollections = { ...mockContext.collections };

const internalShopId = "123";
const internalCatalogProductId = "999";
const internalProductId = "999";
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

test("expect true when product has a child", async () => {
  mockCollections.Products.findOne.mockReturnValueOnce(Promise.resolve(mockVariants[0]));
  const spec = await hasChildVariant(internalProductId, mockCollections);
  expect(spec).toBe(true);
});

test("expect false when product does not a child", async () => {
  mockCollections.Products.findOne.mockReturnValueOnce(Promise.resolve(null));
  const spec = await hasChildVariant(internalVariantIds[1], mockCollections);
  expect(spec).toBe(false);
});
