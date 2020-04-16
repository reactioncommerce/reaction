import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import Factory from "/tests/util/factory.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";

const productQuery = importAsString("./productQuery.graphql");

const encodeProductOpaqueId = encodeOpaqueId("reaction/product");

jest.setTimeout(300000);

const internalShopId = "123";
const internalProductId = "999";
const opaqueProductId = "cmVhY3Rpb24vcHJvZHVjdDo5OTk="; // reaction/product:999
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123

const shopName = "Test Shop";

const mockProduct = {
  _id: internalProductId,
  ancestors: [],
  title: "Fake Product",
  shopId: internalShopId,
  isDeleted: false,
  isVisible: true,
  supportedFulfillmentTypes: ["shipping"],
  type: "simple",
  createdAt: new Date(),
  updatedAt: new Date()
};

const mockVariant = {
  _id: "1001",
  ancestors: [internalProductId],
  attributeLabel: "Variant",
  title: "Fake Product Variant",
  shopId: internalShopId,
  isDeleted: false,
  isVisible: true,
  type: "variant"
};

const mockVariantHidden = {
  _id: "1002",
  ancestors: [internalProductId],
  attributeLabel: "Variant Hidden",
  title: "Fake Product Variant Hidden",
  shopId: internalShopId,
  isDeleted: false,
  isVisible: false,
  type: "variant"
};

const mockVariantDeleted = {
  _id: "1003",
  ancestors: [internalProductId],
  attributeLabel: "Variant Hidden",
  title: "Fake Product Variant Hidden",
  shopId: internalShopId,
  isDeleted: true,
  isVisible: true,
  type: "variant"
};

const mockVariantDeletedHidden = {
  _id: "1004",
  ancestors: [internalProductId],
  attributeLabel: "Variant",
  title: "Fake Product Variant Hidden",
  shopId: internalShopId,
  isDeleted: true,
  isVisible: false,
  type: "variant"
};

const mockOptionOne = {
  _id: "2001",
  ancestors: [internalProductId, "1001"],
  attributeLabel: "Option",
  title: "Fake Product Option One",
  shopId: internalShopId,
  isDeleted: false,
  isVisible: true,
  type: "variant"
};

const mockOptionTwo = {
  _id: "2002",
  ancestors: [internalProductId, "1001"],
  attributeLabel: "Option",
  title: "Fake Product Option One",
  shopId: internalShopId,
  isDeleted: false,
  isVisible: false,
  type: "variant"
};

const mockOptionThree = {
  _id: "2003",
  ancestors: [internalProductId, "1001"],
  attributeLabel: "Option",
  title: "Fake Product Option One",
  shopId: internalShopId,
  isDeleted: true,
  isVisible: true,
  type: "variant"
};

const mockOptionFour = {
  _id: "2004",
  ancestors: [internalProductId, "1001"],
  attributeLabel: "Option",
  title: "Fake Product Option One",
  shopId: internalShopId,
  isDeleted: true,
  isVisible: false,
  type: "variant"
};

const userGroup = Factory.Group.makeOne({
  _id: "customerGroup",
  createdBy: null,
  name: "customer",
  permissions: ["reaction:legacy:products/read"],
  slug: "customer",
  shopId: internalShopId
});

const mockMediaRecord = {
  _id: "mediaRecord-1",
  url: () => "hats.jpg",
  original: {
    name: "hats.jpg",
    size: 120629,
    type: "image/jpeg",
    updatedAt: "2018-06-25T17:20:47.335Z",
    uploadedAt: "2018-06-25T17:21:11.192Z"
  },
  metadata: {
    ownerId: "NGn6GR8L7DfWnfGCh",
    shopId: "shopId",
    productId: internalProductId,
    variantId: "2001",
    priority: 1,
    toGrid: 1,
    workflow: "published"
  },
  copies: {
    image: {
      name: "hats.jpg",
      type: "image/jpeg",
      key: "5b312541d2bc3f00fe7cab1c",
      storageAdapter: "gridfs",
      size: 103909,
      updatedAt: "2018-06-25T17:24:17.717Z",
      createdAt: "2018-06-25T17:24:17.717Z"
    },
    large: {
      name: "hats.jpg",
      type: "image/jpeg",
      key: "5b312541d2bc3f00fe7cab1e",
      storageAdapter: "gridfs",
      size: 49330,
      updatedAt: "2018-06-25T17:24:17.789Z",
      createdAt: "2018-06-25T17:24:17.789Z"
    }
  }
};

let testApp;
let queryProduct;

beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();
  queryProduct = testApp.query(productQuery);
  await insertPrimaryShop(testApp.context, { _id: internalShopId, name: shopName });

  // Mock Media because files plugin isn't registered for integration tests.
  testApp.context.collections.Media = {
    find: () => [mockMediaRecord]
  };


  await testApp.collections.Products.insertOne(mockProduct);
  await testApp.collections.Products.insertOne(mockVariant);
  await testApp.collections.Products.insertOne(mockVariantHidden);
  await testApp.collections.Products.insertOne(mockVariantDeleted);
  await testApp.collections.Products.insertOne(mockVariantDeletedHidden);
  await testApp.collections.Products.insertOne(mockOptionOne);
  await testApp.collections.Products.insertOne(mockOptionTwo);
  await testApp.collections.Products.insertOne(mockOptionThree);
  await testApp.collections.Products.insertOne(mockOptionFour);

  await testApp.collections.Groups.insertOne(userGroup);

  await testApp.setLoggedInUser({
    _id: "123",
    groups: [userGroup._id]
  });
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

test("expect a single product", async () => {
  let result;

  try {
    result = await queryProduct({
      productId: opaqueProductId,
      shopId: opaqueShopId
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.product.title).toEqual("Fake Product");
  expect(result.product.media[0]._id).toEqual(encodeOpaqueId("reaction/mediaRecord", "mediaRecord-1"));
  expect(result.product.media[0].URLs.small).toEqual("hats.jpg");
  expect(result.product.variants[0].title).toEqual("Fake Product Variant");
  expect(result.product.variants[0].options[0].title).toEqual("Fake Product Option One");
  expect(result.product.variants[0].options[0].media[0]._id).toEqual(encodeOpaqueId("reaction/mediaRecord", "mediaRecord-1"));
  expect(result.product.variants[0].options[0].media[0].URLs.small).toEqual("hats.jpg");
});

test("expect only visible variants", async () => {
  let result;

  try {
    result = await queryProduct({
      productId: opaqueProductId,
      shopId: opaqueShopId,
      shouldIncludeHiddenVariants: false
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.product.variants.length).toEqual(1);
  expect(result.product.variants[0]._id).toEqual(encodeProductOpaqueId("1001"));
});

test("expect both hidden and visible variants", async () => {
  let result;

  try {
    result = await queryProduct({
      productId: opaqueProductId,
      shopId: opaqueShopId,
      shouldIncludeHiddenVariants: true
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.product.variants.length).toEqual(2);
  expect(result.product.variants[0]._id).toEqual(encodeProductOpaqueId("1001"));
  expect(result.product.variants[1]._id).toEqual(encodeProductOpaqueId("1002"));
});

test("expect archived and visible variants", async () => {
  let result;

  try {
    result = await queryProduct({
      productId: opaqueProductId,
      shopId: opaqueShopId,
      shouldIncludeHiddenVariants: false,
      shouldIncludeArchivedVariants: true
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.product.variants.length).toEqual(2);
  expect(result.product.variants[0]._id).toEqual(encodeProductOpaqueId("1001"));
  expect(result.product.variants[1]._id).toEqual(encodeProductOpaqueId("1003"));
});

test("expect archived, visible and hidden variants", async () => {
  let result;

  try {
    result = await queryProduct({
      productId: opaqueProductId,
      shopId: opaqueShopId,
      shouldIncludeHiddenVariants: true,
      shouldIncludeArchivedVariants: true
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.product.variants.length).toEqual(4);
  expect(result.product.variants[0]._id).toEqual(encodeProductOpaqueId("1001"));
  expect(result.product.variants[1]._id).toEqual(encodeProductOpaqueId("1002"));
  expect(result.product.variants[2]._id).toEqual(encodeProductOpaqueId("1003"));
  expect(result.product.variants[3]._id).toEqual(encodeProductOpaqueId("1004"));
});

test("expect only visible options", async () => {
  let result;

  try {
    result = await queryProduct({
      productId: opaqueProductId,
      shopId: opaqueShopId,
      shouldIncludeHiddenOptions: false
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.product.variants[0].options.length).toEqual(1);
  expect(result.product.variants[0].options[0]._id).toEqual(encodeProductOpaqueId("2001"));
});

test("expect both hidden and visible options", async () => {
  let result;

  try {
    result = await queryProduct({
      productId: opaqueProductId,
      shopId: opaqueShopId,
      shouldIncludeHiddenOptions: true
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.product.variants[0].options.length).toEqual(2);
  expect(result.product.variants[0].options[0]._id).toEqual(encodeProductOpaqueId("2001"));
  expect(result.product.variants[0].options[1]._id).toEqual(encodeProductOpaqueId("2002"));
});

test("expect archived and visible variants", async () => {
  let result;

  try {
    result = await queryProduct({
      productId: opaqueProductId,
      shopId: opaqueShopId,
      shouldIncludeHiddenOptions: false,
      shouldIncludeArchivedOptions: true
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.product.variants[0].options.length).toEqual(2);
  expect(result.product.variants[0].options[0]._id).toEqual(encodeProductOpaqueId("2001"));
  expect(result.product.variants[0].options[1]._id).toEqual(encodeProductOpaqueId("2003"));
});

test("expect archived, visible and hidden variants", async () => {
  let result;

  try {
    result = await queryProduct({
      productId: opaqueProductId,
      shopId: opaqueShopId,
      shouldIncludeHiddenOptions: true,
      shouldIncludeArchivedOptions: true
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.product.variants[0].options.length).toEqual(4);

  expect(result.product.variants[0].options[0]._id).toEqual(encodeProductOpaqueId("2001"));
  expect(result.product.variants[0].options[1]._id).toEqual(encodeProductOpaqueId("2002"));
  expect(result.product.variants[0].options[2]._id).toEqual(encodeProductOpaqueId("2003"));
  expect(result.product.variants[0].options[3]._id).toEqual(encodeProductOpaqueId("2004"));
});

