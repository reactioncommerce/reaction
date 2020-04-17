import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import insertPrimaryShop from "@reactioncommerce/api-utils/tests/insertPrimaryShop.js";
import { importPluginsJSONFile, ReactionTestAPICore } from "@reactioncommerce/api-core";
// temp mocks
import { internalShopId, opaqueShopId, shopName } from "../../../../mocks/mockShop";
import { internalTagIds, opaqueTagIds } from "../../../../mocks/mockTags";
import {
  mockCatalogItems,
  mockUnsortedCatalogItemsResponse,
  mockSortedByPriceHigh2LowCatalogItemsResponse,
  mockSortedByPriceLow2HighCatalogItemsResponse
} from "../../../../mocks/mockCatalogItems";

const CatalogProductItemsFullQuery = importAsString("./CatalogProductItemsFullQuery.graphql");
const CatalogProductItemsFullQueryPaginated = importAsString("./CatalogProductItemsFullQueryPaginated.graphql");

jest.setTimeout(300000);

let testApp;
let query;
let paginatedQuery;
beforeAll(async () => {
  testApp = new ReactionTestAPICore();
  const plugins = await importPluginsJSONFile("../../../../../plugins.json", (pluginList) => {
    // Remove the `files` plugin when testing. Avoids lots of errors.
    delete pluginList.files;

    return pluginList;
  });
  await testApp.reactionNodeApp.registerPlugins(plugins);
  await testApp.start();
  query = testApp.query(CatalogProductItemsFullQuery);
  paginatedQuery = testApp.query(CatalogProductItemsFullQueryPaginated);
  await insertPrimaryShop(testApp.context, { _id: internalShopId, name: shopName });
  await Promise.all(internalTagIds.map((_id) => testApp.collections.Tags.insertOne({ _id, shopId: internalShopId, slug: `slug${_id}` })));
  await Promise.all(mockCatalogItems.map((mockCatalogItem) => testApp.collections.Catalog.insertOne(mockCatalogItem)));
});

// There is no need to delete any test data from collections because
// testApp.stop() will drop the entire test database. Each integration
// test file gets its own test database.
afterAll(() => testApp.stop());

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
