import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import {
  rewire as rewire$publishProductToCatalogById,
  restore as restore$publishProductToCatalogById
} from "./publishProductToCatalogById.js";
import publishProductsToCatalog from "./publishProductsToCatalog.js";

const mockPublishProductToCatalogById = jest.fn().mockName("publishProductToCatalogById");

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const internalCatalogItemId = "999";
const internalCatalogProductId = "999";
const internalProductId = "999";
const internalTagIds = ["923", "924"];
const internalVariantIds = ["875", "874"];

const productSlug = "fake-product";

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

const mockProduct = {
  _id: internalCatalogItemId,
  shopId: internalShopId,
  barcode: "barcode",
  createdAt,
  description: "description",
  facebookMsg: "facebookMessage",
  fulfillmentService: "fulfillmentService",
  googleplusMsg: "googlePlusMessage",
  height: 11.23,
  length: 5.67,
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
  metaDescription: "metaDescription",
  minOrderQuantity: 5,
  originCountry: "originCountry",
  pageTitle: "pageTitle",
  parcel: {
    containers: "containers",
    length: 4.44,
    width: 5.55,
    height: 6.66,
    weight: 7.77
  },
  pinterestMsg: "pinterestMessage",
  media: [
    {
      metadata: {
        priority: 1,
        productId: internalProductId,
        variantId: null
      },
      thumbnail: "http://localhost/thumbnail",
      small: "http://localhost/small",
      medium: "http://localhost/medium",
      large: "http://localhost/large",
      image: "http://localhost/original"
    }
  ],
  productId: internalProductId,
  productType: "productType",
  shop: {
    _id: opaqueShopId
  },
  sku: "ABC123",
  supportedFulfillmentTypes: ["shipping"],
  handle: productSlug,
  hashtags: internalTagIds,
  title: "Fake Product Title",
  twitterMsg: "twitterMessage",
  type: "product-simple",
  updatedAt,
  mockVariants,
  vendor: "vendor",
  weight: 15.6,
  width: 8.4
};

beforeAll(() => {
  rewire$publishProductToCatalogById(mockPublishProductToCatalogById);
});

afterAll(restore$publishProductToCatalogById);

test("expect true if an array of products are published to the catalog collection by id", async () => {
  mockContext.collections.Products.findOne.mockReturnValueOnce(Promise.resolve(mockProduct));
  mockPublishProductToCatalogById
    .mockReturnValueOnce(Promise.resolve(true))
    .mockReturnValueOnce(Promise.resolve(true))
    .mockReturnValueOnce(Promise.resolve(true));
  const spec = await publishProductsToCatalog(["123", "456", "999"], mockContext);
  expect(spec).toBe(true);
});

test("expect false if an array of products are not published to the catalog collection by id", async () => {
  mockContext.collections.Products.findOne.mockReturnValue(Promise.resolve(mockProduct));
  mockPublishProductToCatalogById.mockReturnValueOnce(Promise.resolve(false));
  const spec = await publishProductsToCatalog(["123", "456", "999"], mockContext);
  expect(spec).toBe(false);
});
