import mockContext from "/imports/test-utils/helpers/mockContext";
import { rewire as rewire$findRevision, restore as restore$findRevision } from "./findRevision";
import getTopVariants from "./getTopVariants";

const mockCollections = { ...mockContext.collections };
const mockFindRevision = jest.fn().mockName("findRevision");

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
    compareAtPrice: 0,
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
    price: 0,
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
    compareAtPrice: 15,
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
    price: 992.0,
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

const mockRevision = {
  _id: "333",
  documentId: internalProductId,
  documentData: {
    _id: internalProductId,
    isVisible: true
  },
  workflow: {
    status: "revision/published"
  },
  documentType: "product",
  createdAt,
  updatedAt,
  diff: []
};

beforeAll(() => {
  rewire$findRevision(mockFindRevision);
});

afterAll(restore$findRevision);

test("expect to fail", async () => {
  mockCollections.Products.toArray.mockReturnValueOnce(Promise.resolve(mockVariants));
  mockFindRevision.mockReturnValueOnce(Promise.resolve(mockRevision));
  const spec = await getTopVariants(internalProductId, mockCollections);
  expect(spec).toEqual([mockRevision.documentData, mockVariants[1]]);
});
