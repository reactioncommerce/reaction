import importAsString from "@reactioncommerce/api-utils/importAsString.js";
import TestApp from "/tests/util/TestApp.js";
import { internalTagIds } from "../../../../mocks/mockTags";
import { mockCatalogItems, mockExternalCatalogProductNodes } from "../../../../mocks/mockCatalogItems";
import { opaqueCatalogItemIds } from "../../../../mocks/mockCatalogProducts";

const CatalogItemProductFullQuery = importAsString("./CatalogItemProductFullQuery.graphql");

jest.setTimeout(300000);

const mockCatalogItem = mockCatalogItems[0];
const internalShopId = "123";
const shopName = "Test Shop";

const expectedItemsResponse = {
  catalogItemProduct: mockExternalCatalogProductNodes[0]
};

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
  try {
    result = await query({ slugOrId: mockCatalogItem.product.slug });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result).toEqual(expectedItemsResponse);
});

test("get a catalog product by ID", async () => {
  let result;
  try {
    result = await query({ slugOrId: opaqueCatalogItemIds[0] });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result).toEqual(expectedItemsResponse);
});
