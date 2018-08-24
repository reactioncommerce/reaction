import mockContext from "/imports/test-utils/helpers/mockContext";
import {
  rewire as rewire$getCatalogProductMedia,
  restore as restore$getCatalogProductMedia
} from "../utils/getCatalogProductMedia";
import { rewire as rewire$isBackorder, restore as restore$isBackorder } from "../utils/isBackorder";
import { rewire as rewire$isLowQuantity, restore as restore$isLowQuantity } from "../utils/isLowQuantity";
import { rewire as rewire$isSoldOut, restore as restore$isSoldOut } from "../utils/isSoldOut";
import hashProduct from "./hashProduct";

const mockCollections = { ...mockContext.collections };

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
const positionUpdatedAt = new Date("2018-04-15T15:34:28.043Z");

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
  isBackorder: false,
  isLowQuantity: false,
  isSoldOut: false,
  length: 5.67,
  lowInventoryWarningThreshold: 2,
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
  positions: {
    _default: {
      weight: 1,
      position: 1,
      pinned: true,
      updatedAt: positionUpdatedAt.toISOString()
    }
  },
  price: {
    max: 5.99,
    min: 2.99,
    range: "2.99 - 5.99"
  },
  media: [
    {
      metadata: {
        toGrid: 1,
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
  taxCode: "taxCode",
  taxDescription: "taxDescription",
  taxable: false,
  title: "Fake Product Title",
  twitterMsg: "twitterMessage",
  type: "product-simple",
  updatedAt,
  mockVariants,
  vendor: "vendor",
  weight: 15.6,
  width: 8.4,
  workflow: {
    status: "new"
  }
};

const updatedMockProduct = {
  publishedProductHash: "769f6d8004a2a2929d143ab242625b6c71f618d8",
  _id: internalCatalogItemId,
  shopId: internalShopId,
  barcode: "barcode",
  createdAt,
  description: "description",
  facebookMsg: "facebookMessage",
  fulfillmentService: "fulfillmentService",
  googleplusMsg: "googlePlusMessage",
  height: 11.23,
  isBackorder: false,
  isLowQuantity: false,
  isSoldOut: false,
  length: 5.67,
  lowInventoryWarningThreshold: 2,
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
  positions: {
    _default: {
      weight: 1,
      position: 1,
      pinned: true,
      updatedAt: positionUpdatedAt.toISOString()
    }
  },
  price: {
    max: 5.99,
    min: 2.99,
    range: "2.99 - 5.99"
  },
  media: [
    {
      metadata: {
        toGrid: 1,
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
  taxCode: "taxCode",
  taxDescription: "taxDescription",
  taxable: false,
  title: "Fake Product Title",
  twitterMsg: "twitterMessage",
  type: "product-simple",
  updatedAt,
  mockVariants,
  vendor: "vendor",
  weight: 15.6,
  width: 8.4,
  workflow: {
    status: "new"
  }
};

const expectedHash = "769f6d8004a2a2929d143ab242625b6c71f618d8";

const mockGetCatalogProductMedia = jest
  .fn()
  .mockName("getCatalogProductMedia")
  .mockReturnValue(Promise.resolve([
    {
      priority: 1,
      toGrid: 1,
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

const mockIsBackorder = jest
  .fn()
  .mockName("isBackorder")
  .mockReturnValue(false);
const mockIsLowQuantity = jest
  .fn()
  .mockName("isLowQuantity")
  .mockReturnValue(false);
const mockIsSoldOut = jest
  .fn()
  .mockName("isSoldOut")
  .mockReturnValue(false);

beforeAll(() => {
  rewire$getCatalogProductMedia(mockGetCatalogProductMedia);
  rewire$isBackorder(mockIsBackorder);
  rewire$isLowQuantity(mockIsLowQuantity);
  rewire$isSoldOut(mockIsSoldOut);
});

afterAll(() => {
  restore$isBackorder();
  restore$isLowQuantity();
  restore$isSoldOut();
  restore$getCatalogProductMedia();
});

test("publishedProductHash", async () => {
  mockCollections.Products.updateOne.mockReturnValueOnce(Promise.resolve({ result: { ok: 1 } }));
  mockCollections.Products.findOne.mockReturnValue(Promise.resolve(updatedMockProduct));
  const spec = await hashProduct(mockProduct._id, mockCollections);

  expect(spec.publishedProductHash).toEqual(expectedHash);
});

test("publishedProductHash was not successfully created, return original product", async () => {
  mockCollections.Products.updateOne.mockReturnValueOnce(Promise.resolve({ result: { ok: 0 } }));
  const spec = await hashProduct(mockProduct._id, mockCollections);
  expect(spec).toEqual(null);
});
