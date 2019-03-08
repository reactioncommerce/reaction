import TestApp from "../TestApp";
import Factory from "/imports/test-utils/helpers/factory";
import CatalogItemQuery from "./CatalogItemQuery.graphql";
import { encodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM=";
const shopName = "Test Shop";

const mockTag = Factory.CatalogProduct.makeOne({
  featuredProductIds: [100, 101, 102, 103, 104],
  shopId: internalShopId
});

const mockCatalogItemsWithTag = Factory.Catalog.makeMany(30, {
  _id: (iterator) => (iterator + 100).toString(),
  product: Factory.CatalogProduct.makeOne({
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
  await testApp.collections.Tags.insertOne({ _id: mockTag._id, shopId: internalShopId });
  await Promise.all(mockCatalogItemsWithTag.map((mockItem) => testApp.collections.Catalog.insertOne(mockItem)));
});

afterAll(async () => {
  debugger;
  await testApp.collections.Shops.deleteOne({ _id: internalShopId });
  await testApp.collections.Tags.deleteOne({ _id: mockTag._id, shopId: internalShopId });
  await Promise.all(mockCatalogItemsWithTag.map((mockItem) => testApp.collections.Catalog.deleteOne({ _id: mockItem._id })));
  testApp.stop();
});

test("get all items for one tag in one shop", async () => {
  let result;
  try {
    result = await query({ shopIds: [opaqueShopId], tagIds: [mockTag._id] });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.catalogItems.nodes.length).toEqual(30);
});

test.only("get all items for on tag in order of featured, desc", async () => {
  let result;
  try {
    result = await query({ shopIds: [opaqueShopId], tagIds: [encodeTagOpaqueId(mockTag._id)], sortBy: "featured" });
  } catch (error) {
    console.log(error);
    debugger;
    expect(error).toBeUndefined();
    return;
  }
  expect(result.catalogItems.nodes.length).toEqual(30);
  expect(result.catalogItems.nodes[0]._id).toEqual(mockTag.featuredTagIds[0]);
  expect(result.catalogItems.nodes[1]._id).toEqual(mockTag.featuredTagIds[1]);
  expect(result.catalogItems.nodes[2]._id).toEqual(mockTag.featuredTagIds[2]);
  expect(result.catalogItems.nodes[3]._id).toEqual(mockTag.featuredTagIds[3]);
  expect(result.catalogItems.nodes[4]._id).toEqual(mockTag.featuredTagIds[4]);
});
