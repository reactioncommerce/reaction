import mockContext from "/imports/test-utils/helpers/mockContext";
import getVariants from "./getVariants";

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
  documentId: internalVariantIds[0],
  documentData: {
    _id: internalVariantIds[0],
    isRevision: internalVariantIds[0],
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

// pass in product id return all variants
test("expect an array of product top level variants from revisions", async () => {
  mockCollections.Products.toArray.mockReturnValueOnce(Promise.resolve([mockVariants[0]]));
  mockCollections.Revisions.findOne.mockReturnValueOnce(Promise.resolve(mockRevision));
  const spec = await getVariants(internalProductId, mockCollections, true);
  const success = [mockRevision.documentData];
  expect(spec).toEqual(success);
});

// pass a variant id return all child options
test("expect an array of product variant options, one from revisions the other from products", async () => {
  mockCollections.Products.toArray.mockReturnValueOnce(Promise.resolve(mockVariants));
  mockCollections.Revisions.findOne.mockReturnValueOnce(Promise.resolve(mockRevision));
  const spec = await getVariants(internalProductId, mockCollections);
  const success = [mockRevision.documentData, mockVariants[1]];
  expect(spec).toEqual(success);
});
