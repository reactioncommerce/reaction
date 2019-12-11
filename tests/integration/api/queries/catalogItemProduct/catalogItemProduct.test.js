import decodeOpaqueIdForNamespace from "@reactioncommerce/api-utils/decodeOpaqueIdForNamespace.js";
import encodeOpaqueId from "@reactioncommerce/api-utils/encodeOpaqueId.js";
import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import TestApp from "/tests/util/TestApp.js";
import Factory from "/tests/util/factory.js";

const CatalogItemProductFullQuery = importAsString("./CatalogItemProductFullQuery.graphql");
const decodeCatalogProductOpaqueId = decodeOpaqueIdForNamespace("reaction/catalogProduct");

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM=";
const shopName = "Test Shop";
const internalTagIds = ["923", "924"];

const mockCatalogItem = Factory.Catalog.makeOne({
  _id: "999",
  product: Factory.CatalogProduct.makeOne({
    _id: "100",
    slug: "fake-product",
    isDeleted: false,
    isVisible: true,
    productId: "100",
    tagIds: internalTagIds,
    shopId: internalShopId
  }),
  shopId: internalShopId
});

jest.setTimeout(300000);

let testApp;
let query;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  query = testApp.query(CatalogItemProductFullQuery);
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await Promise.all(internalTagIds.map((_id) => testApp.collections.Tags.insertOne({ _id, shopId: internalShopId, slug: `slug${_id}` })));
  await testApp.collections.Catalog.insertOne(mockCatalogItem);
});

afterAll(async () => {
  await testApp.collections.Shops.deleteOne({ _id: internalShopId });
  await testApp.collections.Tags.deleteMany({ _id: { $in: internalTagIds } });
  await testApp.collections.Catalog.deleteOne({ _id: mockCatalogItem._id });
  await testApp.stop();
});

test("get a catalog product by slug", async () => {
  let result;

  console.log({mockCatalogItem})

  try {
    result = await query({ slugOrId: mockCatalogItem.product.slug });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  console.log({result})
  expect(result).toEqual({
    _id: encodeOpaqueId("reaction/catalogItem", mockCatalogItem._id),
    shopId: opaqueShopId
  });
});

test("get a catalog product by ID", async () => {
  let result;
  try {
    result = await query({ slugOrId: encodeOpaqueId("reaction/catalogItem", mockCatalogItem._id) });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result).toEqual({
    _id: encodeOpaqueId("reaction/catalogItem", mockCatalogItem._id),
    shopId: opaqueShopId
  });
});
