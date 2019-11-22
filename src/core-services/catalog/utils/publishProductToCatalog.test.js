import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import {
  rewire as rewire$getCatalogProductMedia,
  restore as restore$getCatalogProductMedia
} from "./getCatalogProductMedia.js";
import { rewire as rewire$createCatalogProduct, restore as restore$createCatalogProduct } from "./createCatalogProduct.js";
import publishProductToCatalog from "./publishProductToCatalog.js";

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const internalCatalogItemId = "999";
const internalProductId = "999";
const internalTagIds = ["923", "924"];
const internalVariantIds = ["875", "874"];

const productSlug = "fake-product";

const createdAt = new Date("2018-04-16T15:34:28.043Z");
const updatedAt = new Date("2018-04-17T15:34:28.043Z");

const mockVariants = [
  {
    _id: internalVariantIds[0],
    attributeLabel: "attributeLabel",
    barcode: "barcode",
    createdAt,
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
    optionTitle: "Untitled Option",
    originCountry: "US",
    shopId: internalShopId,
    sku: "sku",
    title: "Small Concrete Pizza",
    updatedAt,
    variantId: internalVariantIds[0],
    weight: 0,
    width: 0
  },
  {
    _id: internalVariantIds[0],
    attributeLabel: "attributeLabel",
    barcode: "barcode",
    createdAt,
    height: 0,
    index: 0,
    length: 5,
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
    minOrderQuantity: 5,
    optionTitle: "Untitled Option 2",
    originCountry: "US",
    shopId: internalShopId,
    sku: "sku",
    title: "Small Concrete Pizza",
    updatedAt,
    variantId: internalVariantIds[1],
    weight: 2,
    width: 2
  }
];

const mockProduct = {
  _id: internalCatalogItemId,
  barcode: "abc123",
  createdAt,
  description: "Mock product description",
  height: 11.23,
  isDeleted: false,
  isVisible: true,
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
  productId: internalProductId,
  productType: "productType",
  shopId: internalShopId,
  sku: "ABC123",
  slug: "mock-product-slug",
  supportedFulfillmentTypes: ["shipping"],
  title: "Fake Product Title",
  type: "product-simple",
  updatedAt,
  variants: mockVariants,
  vendor: "vendor",
  weight: 15.6,
  width: 8.4
};

const updatedMockProduct = {
  hash: "769f6d8004a2a2929d143ab242625b6c71f618d8",
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
  variants: mockVariants,
  vendor: "vendor",
  weight: 15.6,
  width: 8.4,
  workflow: {
    status: "new"
  }
};

const mockShop = {
  currency: "USD"
};

const mockGeCatalogProductMedia = jest
  .fn()
  .mockName("getCatalogProductMedia")
  .mockReturnValue(Promise.resolve([
    {
      priority: 1,
      productId: internalProductId,
      variantId: internalVariantIds[1],
      URLs: {
        large: "large/path/to/image.jpg",
        medium: "medium/path/to/image.jpg",
        original: "image/path/to/image.jpg",
        small: "small/path/to/image.jpg",
        thumbnail: "thumbnail/path/to/image.jpg"
      }
    }
  ]));

const mockCreateCatalogProduct = jest
  .fn()
  .mockName("createCatalogProduct")
  .mockReturnValue(mockProduct);

beforeAll(() => {
  rewire$getCatalogProductMedia(mockGeCatalogProductMedia);
  rewire$createCatalogProduct(mockCreateCatalogProduct);
});

afterAll(() => {
  restore$getCatalogProductMedia();
  restore$createCatalogProduct();
});

test("expect true if a product is published to the catalog collection", async () => {
  mockContext.collections.Products.toArray.mockReturnValueOnce(Promise.resolve(mockVariants));
  mockContext.collections.Shops.findOne.mockReturnValueOnce(Promise.resolve(mockShop));
  mockContext.collections.Products.findOne.mockReturnValue(Promise.resolve(updatedMockProduct));
  mockContext.collections.Catalog.updateOne.mockReturnValueOnce(Promise.resolve({ result: { ok: 1 } }));
  const spec = await publishProductToCatalog(mockProduct, mockContext);

  expect(spec).toBe(true);
});

test("expect false if a product is not published to the catalog collection", async () => {
  mockContext.collections.Products.toArray.mockReturnValueOnce(Promise.resolve(mockVariants));
  mockContext.collections.Shops.findOne.mockReturnValueOnce(Promise.resolve(mockShop));
  mockContext.collections.Catalog.updateOne.mockReturnValueOnce(Promise.resolve({ result: { ok: 0 } }));
  const spec = await publishProductToCatalog(mockProduct, mockContext);
  expect(spec).toBe(false);
});
