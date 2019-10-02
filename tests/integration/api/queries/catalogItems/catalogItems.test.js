import TestApp from "/imports/test-utils/helpers/TestApp";
// temp mocks
import { internalShopId, opaqueShopId, shopName } from "../../../../mocks/mockShop";
import { internalTagIds, opaqueTagIds } from "../../../../mocks/mockTags";
import { internalCatalogItemIds } from "../../../../mocks/mockCatalogProducts";
import {
  mockCatalogItems,
  mockUnsortedCatalogItemsResponse,
  mockSortedByPriceHigh2LowCatalogItemsResponse,
  mockSortedByPriceLow2HighCatalogItemsResponse
} from "../../../../mocks/mockCatalogItems";
// temp mocks
import CatalogProductItemsFullQuery from "./CatalogProductItemsFullQuery.graphql";
import CatalogProductItemsFullQueryPaginated from "./CatalogProductItemsFullQueryPaginated.graphql";

jest.setTimeout(300000);

let testApp;
let query;
let paginatedQuery;
beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  query = testApp.query(CatalogProductItemsFullQuery);
  paginatedQuery = testApp.query(CatalogProductItemsFullQueryPaginated);
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await Promise.all(internalTagIds.map((_id) => testApp.collections.Tags.insertOne({ _id, shopId: internalShopId, slug: `slug${_id}` })));
  await Promise.all(mockCatalogItems.map((mockCatalogItem) => testApp.collections.Catalog.insertOne(mockCatalogItem)));
});

afterAll(async () => {
  await testApp.collections.Shops.deleteOne({ _id: internalShopId });
  await testApp.collections.Tags.deleteMany({ _id: { $in: internalTagIds } });
  await testApp.collections.Catalog.deleteOne({ _id: internalCatalogItemIds[0] });
  await testApp.collections.Catalog.deleteOne({ _id: internalCatalogItemIds[1] });
  await testApp.stop();
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

test("expect CatalogItemProducts with offset 0 to return first item", async () => {
  let result;
  try {
    result = await paginatedQuery({
      shopIds: [opaqueShopId],
      offset: 0
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.catalogItems.totalCount).toBe(2);
  expect(result.catalogItems.nodes.length).toBe(2);
  expect(result.catalogItems.nodes[0].product._id).toEqual(mockUnsortedCatalogItemsResponse.catalogItems.nodes[0].product._id);
});

// expect CatalogItems with offset to skip items
test("expect CatalogitemProducts with offset to skip items", async () => {
  let result;
  try {
    result = await paginatedQuery({
      shopIds: [opaqueShopId],
      offset: 1
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.catalogItems.pageInfo.hasNextPage).toBe(false);
  expect(result.catalogItems.pageInfo.hasPreviousPage).toBe(true);
  expect(result.catalogItems.nodes.length).toBe(1);
  expect(result.catalogItems.nodes[0].product._id).toEqual(mockUnsortedCatalogItemsResponse.catalogItems.nodes[1].product._id);
});

// expect CatalogItems with feature sortBy and offset to skip items correctly
test("expect CatalogitemProducts with offset and featured sort to skip items", async () => {
  let result;
  try {
    result = await paginatedQuery({
      shopIds: [opaqueShopId],
      offset: 1,
      sortBy: "featured",
      tagIds: [opaqueTagIds[0]]
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.catalogItems.pageInfo.hasNextPage).toBe(false);
  expect(result.catalogItems.pageInfo.hasPreviousPage).toBe(true);
  expect(result.catalogItems.nodes.length).toBe(1);
  expect(result.catalogItems.nodes[0].product._id).toEqual(mockUnsortedCatalogItemsResponse.catalogItems.nodes[0].product._id);
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
