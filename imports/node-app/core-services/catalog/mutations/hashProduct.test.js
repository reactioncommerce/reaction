import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import {
  rewire as rewire$getCatalogProductMedia,
  restore as restore$getCatalogProductMedia
} from "../utils/getCatalogProductMedia.js";
import { rewire as rewire$getTopLevelProduct, restore as restore$getTopLevelProduct } from "../utils/getTopLevelProduct.js";
import hashProduct, { rewire$createProductHash, restore as restore$hashProduct } from "./hashProduct.js";

const mockCollections = { ...mockContext.collections };

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const internalCatalogItemId = "999";
const internalProductId = "999";
const internalTagIds = ["923", "924"];
const internalVariantIds = ["875", "874"];

const productSlug = "fake-product";

const createdAt = new Date("2018-04-16T15:34:28.043Z");
const updatedAt = new Date("2018-04-17T15:34:28.043Z");

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
  vendor: "vendor",
  weight: 15.6,
  width: 8.4,
  workflow: {
    status: "new"
  }
};

const mockGetCatalogProductMedia = jest
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

const mockCreateProductHash = jest.fn().mockName("createProductHash").mockReturnValue("fake_hash");
const mockGetTopLevelProduct = jest.fn().mockName("getTopLevelProduct").mockReturnValue(mockProduct);

beforeAll(() => {
  rewire$createProductHash(mockCreateProductHash);
  rewire$getCatalogProductMedia(mockGetCatalogProductMedia);
  rewire$getTopLevelProduct(mockGetTopLevelProduct);
});

afterAll(() => {
  restore$hashProduct();
  restore$getCatalogProductMedia();
  restore$getTopLevelProduct();
});

test("successful update when publishing", async () => {
  mockCollections.Products.updateOne.mockReturnValueOnce(Promise.resolve({ result: { ok: 1 } }));
  const updatedProduct = await hashProduct(mockProduct._id, mockCollections);

  expect(mockCollections.Products.updateOne).toHaveBeenCalledWith({
    _id: mockProduct._id
  }, {
    $set: {
      currentProductHash: "fake_hash",
      publishedProductHash: "fake_hash",
      updatedAt: jasmine.any(Date)
    }
  });
  expect(updatedProduct.currentProductHash).toEqual("fake_hash");
  expect(updatedProduct.publishedProductHash).toEqual("fake_hash");
});

test("when update fails, returns null", async () => {
  mockCollections.Products.updateOne.mockReturnValueOnce(Promise.resolve({ result: { ok: 0 } }));
  const updatedProduct = await hashProduct(mockProduct._id, mockCollections);

  expect(mockCollections.Products.updateOne).toHaveBeenCalledWith({
    _id: mockProduct._id
  }, {
    $set: {
      currentProductHash: "fake_hash",
      publishedProductHash: "fake_hash",
      updatedAt: jasmine.any(Date)
    }
  });
  expect(updatedProduct).toEqual(null);
});

test("does not update publishedProductHash when isPublished arg is false", async () => {
  mockCollections.Products.updateOne.mockReturnValueOnce(Promise.resolve({ result: { ok: 1 } }));
  const updatedProduct = await hashProduct(mockProduct._id, mockCollections, false);

  expect(mockCollections.Products.updateOne).toHaveBeenCalledWith({
    _id: mockProduct._id
  }, {
    $set: {
      currentProductHash: "fake_hash",
      updatedAt: jasmine.any(Date)
    }
  });
  expect(updatedProduct.currentProductHash).toEqual("fake_hash");
});
