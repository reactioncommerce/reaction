import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import {
  rewire as rewire$publishProductToCatalog,
  restore as restore$publishProductToCatalog
} from "../utils/publishProductToCatalog.js";
import publishProducts from "./publishProducts.js";

const mockPublishProductToCatalog = jest.fn().mockName("publishProductToCatalog");

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const internalCatalogItemId = "999";
const opaqueCatalogItemId = "cmVhY3Rpb24vY2F0YWxvZ0l0ZW06OTk5"; // reaction/catalogItem:999
const internalCatalogProductId = "999";
const opaqueCatalogProductId = "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3Q6OTk5"; // reaction/catalogProduct:999
const internalProductId = "999";
const opaqueProductId = "cmVhY3Rpb24vcHJvZHVjdDo5OTk="; // reaction/product:999
const internalTagIds = ["923", "924"];
const opaqueTagIds = ["cmVhY3Rpb24vdGFnOjkyMw==", "cmVhY3Rpb24vdGFnOjkyNA=="]; // reaction/tag
const internalVariantIds = ["875", "874"];
const opaqueVariantIds = ["cmVhY3Rpb24vcHJvZHVjdDo4NzU=", "cmVhY3Rpb24vcHJvZHVjdDo4NzQ="]; // reaction/product
const opaqueCatalogVariantIds = [
  "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3RWYXJpYW50Ojg3NQ==",
  "cmVhY3Rpb24vY2F0YWxvZ1Byb2R1Y3RWYXJpYW50Ojg3NA=="
]; // reaction/catalogProductVariant

const productSlug = "fake-product";

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
    compareAtPrice: 15,
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
  compareAtPrice: 4.56,
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

const expectedOptionsResponse = [
  {
    _id: opaqueCatalogVariantIds[1],
    barcode: "barcode",
    createdAt: null,
    height: 2,
    index: 0,
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
    shop: {
      _id: opaqueShopId
    },
    sku: "sku",
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "One pound bag",
    updatedAt: null,
    variantId: opaqueVariantIds[1],
    weight: 2,
    width: 2
  }
];

const expectedVariantsResponse = [
  {
    _id: opaqueCatalogVariantIds[0],
    barcode: "barcode",
    createdAt: createdAt.toISOString(),
    height: 0,
    index: 0,
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
    options: expectedOptionsResponse,
    originCountry: "US",
    shop: {
      _id: opaqueShopId
    },
    sku: "sku",
    taxCode: "0000",
    taxDescription: "taxDescription",
    title: "Small Concrete Pizza",
    updatedAt: updatedAt.toISOString(),
    variantId: opaqueVariantIds[0],
    weight: 0,
    width: 0
  }
];

const expectedItemsResponse = {
  catalogItems: {
    nodes: [
      {
        _id: opaqueCatalogItemId,
        createdAt: createdAt.toISOString(),
        updatedAt: updatedAt.toISOString(),
        shop: {
          _id: opaqueShopId
        },
        product: {
          _id: opaqueCatalogProductId,
          barcode: "barcode",
          createdAt: createdAt.toISOString(),
          description: "description",
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
          productId: opaqueProductId,
          media: [
            {
              priority: 1,
              productId: opaqueProductId,
              variantId: null,
              URLs: {
                thumbnail: "http://localhost/thumbnail",
                small: "http://localhost/small",
                medium: "http://localhost/medium",
                large: "http://localhost/large",
                original: "http://localhost/original"
              }
            }
          ],
          primaryImage: {
            priority: 1,
            productId: opaqueProductId,
            variantId: null,
            URLs: {
              thumbnail: "http://localhost/thumbnail",
              small: "http://localhost/small",
              medium: "http://localhost/medium",
              large: "http://localhost/large",
              original: "http://localhost/original"
            }
          },
          productType: "productType",
          shop: {
            _id: opaqueShopId
          },
          sku: "ABC123",
          slug: "fake-product",
          socialMetadata: [
            { service: "twitter", message: "twitterMessage" },
            { service: "facebook", message: "facebookMessage" },
            { service: "googleplus", message: "googlePlusMessage" },
            { service: "pinterest", message: "pinterestMessage" }
          ],
          supportedFulfillmentTypes: ["shipping"],
          tagIds: opaqueTagIds,
          tags: {
            nodes: [{ _id: opaqueTagIds[0] }, { _id: opaqueTagIds[1] }]
          },
          title: "Fake Product Title",
          updatedAt: updatedAt.toISOString(),
          variants: expectedVariantsResponse,
          vendor: "vendor",
          weight: 15.6,
          width: 8.4
        }
      }
    ]
  }
};

beforeAll(() => {
  rewire$publishProductToCatalog(mockPublishProductToCatalog);
});

afterAll(restore$publishProductToCatalog);

test("expect to return a Promise that resolves to an array of CatalogItemProducts", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true).mockReturnValueOnce(true);
  mockContext.collections.Products.toArray.mockReturnValueOnce(Promise.resolve([mockProduct]));
  mockContext.collections.Catalog.toArray.mockReturnValueOnce(Promise.resolve([expectedItemsResponse]));
  mockPublishProductToCatalog.mockReturnValueOnce(Promise.resolve(true));
  const spec = await publishProducts(mockContext, [internalCatalogItemId]);
  expect(spec).toEqual([expectedItemsResponse]);
});
