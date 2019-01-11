import TestApp from "../TestApp";
import { internalShopId, shopName } from "../mocks/mockShop";
import { internalTagIds } from "../mocks/mockTags";
import { mockCatalogItems, mockExternalCatalogProductNodes } from "../mocks/mockCatalogItems";
import { opaqueCatalogItemIds } from "../mocks/mockCatalogProducts";
import CatalogItemProductFullQuery from "./CatalogItemProductFullQuery.graphql";

jest.setTimeout(300000);

const mockCatalogItem = mockCatalogItems[0];

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
  await Promise.all(internalTagIds.map((_id) => testApp.collections.Tags.insert({ _id, shopId: internalShopId })));
  await testApp.collections.Catalog.insert(mockCatalogItem);
});

afterAll(async () => {
  await testApp.collections.Shops.remove({ _id: internalShopId });
  await Promise.all(internalTagIds.map((_id) => testApp.collections.Tags.remove({ _id })));
  await testApp.collections.Catalog.remove({ _id: mockCatalogItem._id });
  testApp.stop();
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
