import TestApp from "../TestApp";
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

jest.setTimeout(300000);

let testApp;
let query;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  query = testApp.query(CatalogProductItemsFullQuery);
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await Promise.all(internalTagIds.map((_id) => testApp.collections.Tags.insert({ _id, shopId: internalShopId })));
  await Promise.all(mockCatalogItems.map((mockCatalogItem) => testApp.collections.Catalog.insert(mockCatalogItem)));
});

afterAll(async () => {
  await testApp.collections.Shops.remove({ _id: internalShopId });
  await testApp.collections.Catalog.remove({ _id: internalCatalogItemIds[0] });
  await testApp.collections.Catalog.remove({ _id: internalCatalogItemIds[1] });
  testApp.stop();
});

test.skip("get all items for shop", async () => {
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
test.skip("expect CatalogItemProducts sorted by minPrice from highest to lowest when sortByPriceCurrencyCode is provided", async () => {
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
test.skip("expect CatalogItemProducts sorted by minPrice from highest to lowest when sortByPriceCurrencyCode is provided and sortOrder is desc", async () => {
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
test.skip("expect CatalogItemProducts sorted by minPrice from lowest to highest when sortByPriceCurrencyCode is provided and sortOrder is asc", async () => {
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
test.skip("expect error when sortByPriceCurrencyCode is not provided while sortBy is minPrice", async () => {
  try {
    await query({
      shopIds: [opaqueShopId],
      sortBy: "minPrice"
    });
  } catch (error) {
    expect(error[0].message).toMatchSnapshot();
  }
});
