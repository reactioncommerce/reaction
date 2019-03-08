import { encodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";
import { encodeCatalogProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/catalogProduct";
import TestApp from "../TestApp";
import Factory from "/imports/test-utils/helpers/factory";
import CatalogItemQuery from "./CatalogItemQuery.graphql";

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM=";
const shopName = "Test Shop";

const mockTag = Factory.Tag.makeOne({
  featuredProductIds: ["110", "111", "112", "113", "114"],
  shopId: internalShopId
});

const mockCatalogItemsWithTag = Factory.Catalog.makeMany(30, {
  product: (iterator) => Factory.CatalogProduct.makeOne({
    _id: (iterator + 100).toString(),
    isDeleted: false,
    isVisible: true,
    tagIds: [mockTag._id],
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
  query = testApp.query(CatalogItemQuery);
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await testApp.collections.Tags.insertOne(mockTag);
  await Promise.all(mockCatalogItemsWithTag.map((mockItem) => testApp.collections.Catalog.insertOne(mockItem)));
});

afterAll(async () => {
  await testApp.collections.Shops.deleteOne({ _id: internalShopId });
  await testApp.collections.Tags.deleteOne({ _id: mockTag._id });
  await Promise.all(mockCatalogItemsWithTag.map((mockItem) => testApp.collections.Catalog.deleteOne({ _id: mockItem._id })));
  testApp.stop();
});

test("get all items for on tag in order of featured, desc, with default limit of 20 items", async () => {
  let result;
  try {
    result = await query({ shopId: opaqueShopId, tagIds: [encodeTagOpaqueId(mockTag._id)], sortBy: "featured" });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.catalogItems.edges.length).toEqual(20);
  expect(result.catalogItems.edges[0].node.product._id).toEqual(encodeCatalogProductOpaqueId("110"));
  expect(result.catalogItems.edges[1].node.product._id).toEqual(encodeCatalogProductOpaqueId("111"));
  expect(result.catalogItems.edges[2].node.product._id).toEqual(encodeCatalogProductOpaqueId("112"));
  expect(result.catalogItems.edges[3].node.product._id).toEqual(encodeCatalogProductOpaqueId("113"));
  expect(result.catalogItems.edges[4].node.product._id).toEqual(encodeCatalogProductOpaqueId("114"));
});
