import { encodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";
import { encodeCatalogProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/catalogProduct";
import TestApp from "../TestApp";
import Factory from "/imports/test-utils/helpers/factory";
import CatalogItemQuery from "./CatalogItemQuery.graphql";

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM=";
const shopName = "Test Shop";

const mockTagWithFeatured = Factory.Tag.makeOne({
  featuredProductIds: ["110", "111", "112", "113", "114"],
  shopId: internalShopId
});

const mockTagWithoutFeatured = Factory.Tag.makeOne({
  shopId: internalShopId
});

const mockTagWithNoProducts = Factory.Tag.makeOne();

const mockCatalogItemsWithFeatured = Factory.Catalog.makeMany(30, {
  product: (iterator) => Factory.CatalogProduct.makeOne({
    _id: (iterator + 100).toString(),
    isDeleted: false,
    isVisible: true,
    tagIds: [mockTagWithFeatured._id],
    shopId: internalShopId
  }),
  shopId: internalShopId
});

const mockCatalogItemsWithoutFeatured = Factory.Catalog.makeMany(50, {
  product: Factory.CatalogProduct.makeOne({
    isDeleted: false,
    isVisible: true,
    tagIds: [mockTagWithoutFeatured._id],
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
  await testApp.collections.Tags.insertOne(mockTagWithFeatured);
  await testApp.collections.Tags.insertOne(mockTagWithoutFeatured);
  await testApp.collections.Tags.insertOne(mockTagWithNoProducts);
  await Promise.all(mockCatalogItemsWithFeatured.map((mockItem) => testApp.collections.Catalog.insertOne(mockItem)));
  await Promise.all(mockCatalogItemsWithoutFeatured.map((mockItem) => testApp.collections.Catalog.insertOne(mockItem)));
});

afterAll(async () => {
  await testApp.collections.Shops.deleteOne({ _id: internalShopId });
  await testApp.collections.Tags.deleteOne({ _id: mockTagWithFeatured._id });
  await testApp.collections.Tags.deleteOne({ _id: mockTagWithoutFeatured._id });
  await testApp.collections.Tags.deleteOne({ _id: mockTagWithNoProducts._id });
  await Promise.all(mockCatalogItemsWithFeatured.map((mockItem) => testApp.collections.Catalog.deleteOne({ _id: mockItem._id })));
  await Promise.all(mockCatalogItemsWithoutFeatured.map((mockItem) => testApp.collections.Catalog.deleteOne({ _id: mockItem._id })));
  testApp.stop();
});

test("get all items for on tag without sort", async () => {
  let result;
  try {
    result = await query({ shopId: opaqueShopId, tagIds: [encodeTagOpaqueId(mockTagWithFeatured._id)] });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.catalogItems.totalCount).toEqual(30);
  expect(result.catalogItems.pageInfo.hasNextPage).toEqual(true);
  expect(result.catalogItems.pageInfo.hasPreviousPage).toEqual(false);
  expect(result.catalogItems.edges.length).toEqual(20);
});

test("get items for a tag sorted by featured", async () => {
  let result;
  try {
    result = await query({ shopId: opaqueShopId, tagIds: [encodeTagOpaqueId(mockTagWithFeatured._id)], sortBy: "featured" });
  } catch (error) {
    console.log(error);
    console.log(JSON.stringify(error, null, "  "));
    expect(error).toBeUndefined();
    return;
  }
  expect(result.catalogItems.totalCount).toEqual(30);
  expect(result.catalogItems.pageInfo.hasNextPage).toEqual(true);
  expect(result.catalogItems.pageInfo.hasPreviousPage).toEqual(false);
  expect(result.catalogItems.edges.length).toEqual(20);
  expect(result.catalogItems.edges[0].node.product._id).toEqual(encodeCatalogProductOpaqueId("110"));
  expect(result.catalogItems.edges[1].node.product._id).toEqual(encodeCatalogProductOpaqueId("111"));
  expect(result.catalogItems.edges[2].node.product._id).toEqual(encodeCatalogProductOpaqueId("112"));
  expect(result.catalogItems.edges[3].node.product._id).toEqual(encodeCatalogProductOpaqueId("113"));
  expect(result.catalogItems.edges[4].node.product._id).toEqual(encodeCatalogProductOpaqueId("114"));
});

test("get all items for a tag sorted by featured, even without any featuredProductIds", async () => {
  let result;
  try {
    result = await query({ shopId: opaqueShopId, tagIds: [encodeTagOpaqueId(mockTagWithoutFeatured._id)] });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.catalogItems.totalCount).toEqual(50);
  expect(result.catalogItems.pageInfo.hasNextPage).toEqual(true);
  expect(result.catalogItems.pageInfo.hasPreviousPage).toEqual(false);
  expect(result.catalogItems.edges.length).toEqual(20);
});

test("get no items for a tag that does not exist", async () => {
  let result;
  try {
    result = await query({ shopId: opaqueShopId, tagIds: [encodeTagOpaqueId("12455623")] });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.catalogItems.totalCount).toEqual(0);
});

test("get empty array of items for a tag sorted by featured, that doesn't have any products", async () => {
  let result;
  try {
    result = await query({ shopId: opaqueShopId, tagIds: [encodeTagOpaqueId(mockTagWithNoProducts._id)] });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.catalogItems.totalCount).toEqual(0);
  expect(result.catalogItems.pageInfo.hasNextPage).toEqual(false);
  expect(result.catalogItems.pageInfo.hasPreviousPage).toEqual(false);
  expect(result.catalogItems.edges.length).toEqual(0);
});