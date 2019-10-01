import Factory from "/imports/test-utils/helpers/factory";
import TestApp from "/imports/test-utils/helpers/TestApp";
import { encodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";
import { decodeCatalogProductOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/catalogProduct";
import CatalogItemQuery from "./CatalogItemQuery.graphql";

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM=";
const shopName = "Test Shop";

const mockTagWithFeatured = Factory.Tag.makeOne({
  featuredProductIds: ["110", "111", "112", "113", "114"],
  shopId: internalShopId,
  slug: "1"
});

const mockTagWithoutFeatured = Factory.Tag.makeOne({
  shopId: internalShopId,
  slug: "2"
});

const mockTagWithNoProducts = Factory.Tag.makeOne({
  slug: "3"
});

const mockCatalogItemsWithFeatured = Factory.Catalog.makeMany(30, {
  _id: (iterator) => (iterator + 100).toString(),
  product: (iterator) => Factory.CatalogProduct.makeOne({
    _id: (iterator + 100).toString(),
    isDeleted: false,
    isVisible: true,
    productId: (iterator + 100).toString(),
    tagIds: [mockTagWithFeatured._id],
    shopId: internalShopId
  }),
  shopId: internalShopId
});

const mockCatalogItemsWithoutFeatured = Factory.Catalog.makeMany(50, {
  _id: (iterator) => (iterator + 500).toString(),
  product: (iterator) => Factory.CatalogProduct.makeOne({
    _id: (iterator + 500).toString(),
    productId: (iterator + 500).toString(),
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
  await testApp.stop();
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

test("get items for a tag sorted by featured - in order of featuredProductIds", async () => {
  let result;
  try {
    result = await query({ shopId: opaqueShopId, tagIds: [encodeTagOpaqueId(mockTagWithFeatured._id)], sortBy: "featured" });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.catalogItems.totalCount).toBe(30);
  expect(result.catalogItems.pageInfo.hasNextPage).toBe(true);
  expect(result.catalogItems.pageInfo.hasPreviousPage).toBe(false);
  expect(decodeCatalogProductOpaqueId(result.catalogItems.edges[0].node.product._id)).toBe("110");
  expect(decodeCatalogProductOpaqueId(result.catalogItems.edges[1].node.product._id)).toBe("111");
  expect(decodeCatalogProductOpaqueId(result.catalogItems.edges[2].node.product._id)).toBe("112");
  expect(decodeCatalogProductOpaqueId(result.catalogItems.edges[3].node.product._id)).toBe("113");
  expect(decodeCatalogProductOpaqueId(result.catalogItems.edges[4].node.product._id)).toBe("114");
});

test("get items for a tag sorted by featured - return 20 items by default if no first or last are provided", async () => {
  let result;
  try {
    result = await query({ shopId: opaqueShopId, tagIds: [encodeTagOpaqueId(mockTagWithFeatured._id)], sortBy: "featured" });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.catalogItems.edges.length).toEqual(20);
});

test("get items for a tag sorted by featured - return number of items specified by first", async () => {
  let result;
  try {
    result = await query({ shopId: opaqueShopId, tagIds: [encodeTagOpaqueId(mockTagWithFeatured._id)], sortBy: "featured", first: 12 });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.catalogItems.edges.length).toEqual(12);
});

test("get items for a tag sorted by featured - return number of items specified by last", async () => {
  let result;
  try {
    result = await query({ shopId: opaqueShopId, tagIds: [encodeTagOpaqueId(mockTagWithFeatured._id)], sortBy: "featured", last: 13 });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.catalogItems.edges.length).toEqual(13);
});

test("get items for a tag sorted by featured - with correct pagination counts", async () => {
  let result;
  try {
    result = await query({ shopId: opaqueShopId, tagIds: [encodeTagOpaqueId(mockTagWithFeatured._id)], sortBy: "featured" });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.catalogItems.totalCount).toEqual(30);
  expect(result.catalogItems.pageInfo.hasNextPage).toEqual(true);
  expect(result.catalogItems.pageInfo.hasPreviousPage).toEqual(false);
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

test("get correct start and end cursors for a sort query", async () => {
  let result;
  try {
    result = await query({ shopId: opaqueShopId, tagIds: [encodeTagOpaqueId(mockTagWithFeatured._id)], sortBy: "featured" });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.catalogItems.pageInfo.startCursor).toBeTruthy();
  expect(result.catalogItems.pageInfo.endCursor).toBeTruthy();
  expect(result.catalogItems.pageInfo.startCursor).toEqual(result.catalogItems.edges[0].cursor);
  expect(result.catalogItems.pageInfo.endCursor).toEqual(result.catalogItems.edges[result.catalogItems.edges.length - 1].cursor);
});

test("paginate forwards, using cursors from a previous query", async () => {
  let defaultQuery;
  let firstQuery;
  let secondQuery;
  try {
    defaultQuery = await query({
      shopId: opaqueShopId,
      tagIds: [encodeTagOpaqueId(mockTagWithFeatured._id)],
      sortBy: "featured",
      first: 30
    });
    firstQuery = await query({
      shopId: opaqueShopId,
      tagIds: [encodeTagOpaqueId(mockTagWithFeatured._id)],
      sortBy: "featured",
      first: 20
    });
    secondQuery = await query({
      shopId: opaqueShopId,
      tagIds: [encodeTagOpaqueId(mockTagWithFeatured._id)],
      sortBy: "featured",
      after: firstQuery.catalogItems.pageInfo.endCursor,
      first: 20
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  // defaultQuery gets all items at once, so hasNext and hasPrevious are false
  expect(defaultQuery.catalogItems.pageInfo.hasNextPage).toEqual(false);
  expect(defaultQuery.catalogItems.pageInfo.hasPreviousPage).toEqual(false);
  // firstQuery gets the first 20, so hasNext is true and hasPrevious is false
  expect(firstQuery.catalogItems.pageInfo.hasNextPage).toEqual(true);
  expect(firstQuery.catalogItems.pageInfo.hasPreviousPage).toEqual(false);
  // secondQuery gets the last 10, so hasNext is false and hasPrevious is true
  expect(secondQuery.catalogItems.pageInfo.hasNextPage).toEqual(false);
  expect(secondQuery.catalogItems.pageInfo.hasPreviousPage).toEqual(true);
  expect(secondQuery.catalogItems.pageInfo).toBeTruthy();
  expect(secondQuery.catalogItems.totalCount).toEqual(30);
  // totalCount is 30, and the first 20 after the first 20 were queried.
  expect(secondQuery.catalogItems.edges.length).toEqual(10);
  // totalCount is 30, and the first 20 after the first 20 were queried, so there are only 10 left.
  expect(secondQuery.catalogItems.edges[0].node._id).toEqual(defaultQuery.catalogItems.edges[20].node._id);
  // get the 21st item
  // eslint-disable-next-line max-len
  expect(secondQuery.catalogItems.edges[secondQuery.catalogItems.edges.length - 1].node._id).toEqual(defaultQuery.catalogItems.edges[defaultQuery.catalogItems.edges.length - 1].node._id);
});

test("paginate forwards, by pages of 15, using cursors from a previous query", async () => {
  let defaultQuery;
  let firstQuery;
  let secondQuery;
  try {
    defaultQuery = await query({
      shopId: opaqueShopId,
      tagIds: [encodeTagOpaqueId(mockTagWithFeatured._id)],
      sortBy: "featured",
      first: 30
    });
    firstQuery = await query({
      shopId: opaqueShopId,
      tagIds: [encodeTagOpaqueId(mockTagWithFeatured._id)],
      sortBy: "featured",
      first: 15
    });
    secondQuery = await query({
      shopId: opaqueShopId,
      tagIds: [encodeTagOpaqueId(mockTagWithFeatured._id)],
      sortBy: "featured",
      after: firstQuery.catalogItems.pageInfo.endCursor,
      first: 15
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  // defaultQuery gets all items at once, so hasNext and hasPrevious are false
  expect(defaultQuery.catalogItems.pageInfo.hasNextPage).toEqual(false);
  expect(defaultQuery.catalogItems.pageInfo.hasPreviousPage).toEqual(false);
  // firstQuery gets the first 15, so hasNext is true and hasPrevious is false
  expect(firstQuery.catalogItems.pageInfo.hasNextPage).toEqual(true);
  expect(firstQuery.catalogItems.pageInfo.hasPreviousPage).toEqual(false);
  expect(firstQuery.catalogItems.edges.length).toEqual(15);
  // secondQuery gets the last 15, so hasNext is false and hasPrevious is true
  expect(secondQuery.catalogItems.edges.length).toEqual(15);
  // expect(secondQuery.catalogItems.pageInfo.hasNextPage).toEqual(false);
  // expect(secondQuery.catalogItems.pageInfo.hasPreviousPage).toEqual(true);
  // totalCount is 30, and the first 15 after the first 15 were queried, so there are only 10 left.
  expect(secondQuery.catalogItems.edges[0].node._id).toEqual(defaultQuery.catalogItems.edges[15].node._id);
  // get the last item
  // eslint-disable-next-line max-len
  expect(secondQuery.catalogItems.edges[secondQuery.catalogItems.edges.length - 1].node._id).toEqual(defaultQuery.catalogItems.edges[defaultQuery.catalogItems.edges.length - 1].node._id);
});
