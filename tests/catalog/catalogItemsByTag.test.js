import TestApp from "../TestApp";
// temp mocks
import { mockMoreCatalogItems } from "../mocks/mockMoreCatalogItems";
// temp mocks
import CatalogProductItemsFullQuery from "./CatalogProductItemsFullQuery.graphql";

const internalTagIds = [
  "sjrKzMBz7HkX3ZSM7", // 8
  "QGxZeKJtfubC4m3ck", // 3
  "4jevtBGXLz2BF8Lf8" // 12
];

const opaqueTagIds = [
  "cmVhY3Rpb24vdGFnOnNqckt6TUJ6N0hrWDNaU003", // T-Shirts
  "cmVhY3Rpb24vdGFnOlFHeFplS0p0ZnViQzRtM2Nr", // Womens
  "cmVhY3Rpb24vdGFnOjRqZXZ0QkdYTHoyQkY4TGY4" // Shirts
];

export const internalShopId = "123";
export const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
export const shopName = "Test Shop";

jest.setTimeout(300000);

let testApp;
let query;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  query = testApp.query(CatalogProductItemsFullQuery);
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await Promise.all(internalTagIds.map((_id) => testApp.collections.Tags.insert({ _id, shopId: internalShopId })));
  await Promise.all(mockMoreCatalogItems.map((mockCatalogItem) => testApp.collections.Catalog.insert(mockCatalogItem)));
});

afterAll(async () => {
  await testApp.collections.Shops.remove({ _id: internalShopId });
  await Promise.all(internalTagIds.map((_id) => testApp.collections.Tags.remove({ _id })));
  await Promise.all(mockMoreCatalogItems.map((mockCatalogItem) => testApp.collections.Catalog.remove({ _id: mockCatalogItem._id })));
  testApp.stop();
});

test("get all items for shop", async () => {
  let result;
  try {
    result = await query({ shopIds: [opaqueShopId], tagIds: [opaqueTagIds[0]] });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  console.log(result);
  expect(result.catalogItems.nodes.length).toEqual(8);
});
