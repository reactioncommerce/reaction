import GraphTester from "../GraphTester";
// temp mocks
import { internalShopId, opaqueShopId, shopName } from "../mocks/mockShop";
import { internalTagIds } from "../mocks/mockTags";
import { internalCatalogItemIds } from "../mocks/mockCatalogProducts";
import {
  mockCatalogItems,
  mockUnsortedCatalogItemsResponse,
  mockSortedByPriceHigh2LowCatalogItemsResponse,
  mockSortedByPriceLow2HighCatalogItemsResponse
} from "../mocks/mockCatalogItems";
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
  await Promise.all(mockCatalogItems.map((mockCatalogItem) => tester.collections.Catalog.insert(mockCatalogItem)));
});

afterAll(async () => {
  await tester.collections.Shops.remove({ _id: internalShopId });
  await tester.collections.Catalog.remove({ _id: internalCatalogItemIds[0] });
  await tester.collections.Catalog.remove({ _id: internalCatalogItemIds[1] });
  tester.stop();
});

test("get all items for shop", async () => {
  let result;
  try {
    result = await query({ shopIds: [opaqueShopId] });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result).toEqual(mockUnsortedCatalogItemsResponse);
});

// expect CatalogItems sorted by minPrice form high to low
test("expect CatalogItemProducts sorted by minPrice from highest to lowest when sortByPriceCurrencyCode is provided", async () => {
  let result;
  try {
    result = await query({ shopIds: [opaqueShopId], sortBy: "minPrice", sortByPriceCurrencyCode: "USD" });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result).toEqual(mockSortedByPriceHigh2LowCatalogItemsResponse);
});

// expect CatalogItems sorted by minPrice form high to low when sortOrder is desc
test("expect CatalogItemProducts sorted by minPrice from highest to lowest when sortByPriceCurrencyCode is provided and sortOrder is desc", async () => {
  let result;
  try {
    result = await query({
      shopIds: [opaqueShopId],
      sortBy: "minPrice",
      sortByPriceCurrencyCode: "USD",
      sortOrder: "desc"
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result).toEqual(mockSortedByPriceHigh2LowCatalogItemsResponse);
});

// expect CatalogItems sorted by minPrice form low to high when sortOrder is asc
test("expect CatalogItemProducts sorted by minPrice from lowest to highest when sortByPriceCurrencyCode is provided and sortOrder is asc", async () => {
  let result;
  try {
    result = await query({
      shopIds: [opaqueShopId],
      sortBy: "minPrice",
      sortByPriceCurrencyCode: "USD",
      sortOrder: "asc"
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result).toEqual(mockSortedByPriceLow2HighCatalogItemsResponse);
});

// expect error when invalid currency code is provided
test("expect error when sortByPriceCurrencyCode is not provided while sortBy is minPrice", async () => {
  try {
    await query({
      shopIds: [opaqueShopId],
      sortBy: "minPrice"
    });
  } catch (error) {
    expect(error[0].message).toMatchSnapshot();
  }
});
