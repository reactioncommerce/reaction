import GraphTester from "../GraphTester";
// temp mocks
import { internalShopId, opaqueShopId, shopName } from "../mocks/mockShop";
import { internalTagIds } from "../mocks/mockTags";
import { internalCatalogItemIds } from "../mocks/mockCatalogProducts";
import { mockCatalogItems, mockUnsortedCatalogItemsResponse } from "../mocks/mockCatalogItems";
// temp mocks
import CatalogProductItemsFullQuery from "./CatalogProductItemsFullQuery.graphql";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

let tester;
let query;
beforeAll(async () => {
  tester = new GraphTester();
  await tester.start();
  query = tester.query(CatalogProductItemsFullQuery);
  await tester.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await Promise.all(internalTagIds.map((_id) => tester.collections.Tags.insert({ _id, shopId: internalShopId })));
});

afterAll(async () => {
  await tester.collections.Shops.remove({ _id: internalShopId });
  tester.stop();
});

test("get all items for shop", async () => {
  await Promise.all(mockCatalogItems.map((mockCatalogItem) => tester.collections.Catalog.insert(mockCatalogItem)));

  let result;
  try {
    result = await query({ shopIds: [opaqueShopId] });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result).toEqual(mockUnsortedCatalogItemsResponse);

  await tester.collections.Catalog.remove({ _id: internalCatalogItemIds[0] });
  await tester.collections.Catalog.remove({ _id: internalCatalogItemIds[1] });
});

// // expect CatalogItems sorted by minPrice form high to low
// test("expect CatalogItemProducts sorted by minPrice from highest to lowest when sortByPriceCurrencyCode is provided", async () => {
//   //await tester.collections.Catalog.insert(mockCatalogItem);
//   await tester.collections.Catalog.insert(mockCatalogItemTwo);

//   let result;
//   try {
//     result = await query({ shopIds: [opaqueShopId], sortBy: "minPrice", sortByPriceCurrencyCode: "USD" });
//   } catch (error) {
//     expect(error).toBeUndefined();
//     return;
//   }

//   expect(result).toEqual(mockSortedLowToHightCatalogItemProducts);

//   await tester.collections.Catalog.remove({ _id: internalCatalogItemIds[0] });
//   await tester.collections.Catalog.remove({ _id: internalCatalogItemIds[1] });
// });

// // expect CatalogItems sorted by minPrice form high to low when sortOrder is desc
// test("expect CatalogItemProducts sorted by minPrice from highest to lowest when sortByPriceCurrencyCode is provided and sortOrder is desc", async () => {
//   const spec = false;
//   expect(spec).toBe(true);
// });

// // expect CatalogItems sorted by minPrice form low to high when sortOrder is asc
// test("expect CatalogItemProducts sorted by minPrice from lowest to highest when sortByPriceCurrencyCode is provided and sortOrder is asc", async () => {
//   const spec = false;
//   expect(spec).toBe(true);
// });

// // expect error when invalid currency code is provided
// test("expect error when sortByPriceCurrencyCode is provided an invalid currecnyCode", async () => {
//   const spec = false;
//   expect(spec).toBe(true);
// });
