import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import Factory from "/tests/util/factory.js";
import TestApp from "/tests/util/TestApp.js";

const CreateProductMutation = importAsString("./createProduct.graphql");

jest.setTimeout(300000);

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123

const shopName = "Test Shop";

const expectedProduct = {
  _id: jasmine.any(String),
  createdAt: jasmine.any(String),
  currentProductHash: null,
  description: null,
  isDeleted: false,
  isVisible: false,
  metaDescription: null,
  metafields: [],
  originCountry: null,
  pageTitle: null,
  productType: null,
  publishedAt: null,
  publishedProductHash: null,
  shop: {
    _id: opaqueShopId
  },
  shouldAppearInSitemap: true,
  slug: "",
  socialMetadata: [
    { service: "facebook", message: "" },
    { service: "googleplus", message: "" },
    { service: "pinterest", message: "" },
    { service: "twitter", message: "" }
  ],
  supportedFulfillmentTypes: ["shipping"],
  tagIds: [],
  title: "",
  updatedAt: jasmine.any(String),
  variants: [
    {
      _id: jasmine.any(String)
    }
  ],
  vendor: null
};

let testApp;
let mutate;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  mutate = testApp.mutate(CreateProductMutation);
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });

  const adminGroup = Factory.Group.makeOne({
    _id: "adminGroup",
    createdBy: null,
    name: "admin",
    permissions: ["reaction:legacy:products/create"],
    slug: "admin",
    shopId: internalShopId
  });
  await testApp.collections.Groups.insertOne(adminGroup);

  await testApp.setLoggedInUser({
    _id: "123",
    groups: [adminGroup._id],
    shopId: internalShopId
  });
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("expect a product to be created using `shopId` as input", async () => {
  let result;
  try {
    result = await mutate({ input: { shopId: opaqueShopId } });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result).toEqual({
    createProduct: {
      product: expectedProduct
    }
  });
});

test("expect a product to be created with all product input", async () => {
  const productData = {
    description: "description",
    facebookMsg: "facebookMsg",
    googleplusMsg: "googleplusMsg",
    isVisible: true,
    metaDescription: "metaDescription",
    metafields: [
      { key: "size", value: "small" },
      { key: "pattern", value: "striped" }
    ],
    originCountry: "USA",
    pageTitle: "pageTitle",
    pinterestMsg: "pinterestMsg",
    productType: "productType",
    shouldAppearInSitemap: false,
    slug: "custom-slug",
    supportedFulfillmentTypes: ["pickup", "shipping"],
    title: "title",
    twitterMsg: "twitterMsg",
    vendor: "vendor"
  };

  let result;
  try {
    result = await mutate({
      input: {
        product: productData,
        shopId: opaqueShopId
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result).toEqual({
    createProduct: {
      product: {
        ...expectedProduct,
        ...productData,
        facebookMsg: undefined,
        googleplusMsg: undefined,
        pinterestMsg: undefined,
        twitterMsg: undefined,
        socialMetadata: [
          { service: "facebook", message: "facebookMsg" },
          { service: "googleplus", message: "googleplusMsg" },
          { service: "pinterest", message: "pinterestMsg" },
          { service: "twitter", message: "twitterMsg" }
        ]
      }
    }
  });
});

test("non-opaque _id can be provided optionally", async () => {
  const id = "CUSTOM_ID";
  const encodedId = "cmVhY3Rpb24vcHJvZHVjdDpDVVNUT01fSUQ="; // reaction/product:CUSTOM_ID

  let result;
  try {
    result = await mutate({
      input: {
        product: { _id: id },
        shopId: opaqueShopId
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.createProduct.product._id).toEqual(encodedId);
});

test("no variant is created when shouldCreateFirstVariant is false", async () => {
  let result;
  try {
    result = await mutate({
      input: {
        shopId: opaqueShopId,
        shouldCreateFirstVariant: false
      }
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.createProduct.product.variants.length).toBe(0);
});
