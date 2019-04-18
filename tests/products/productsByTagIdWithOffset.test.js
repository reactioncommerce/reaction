import { encodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";
import { tagProductsQueryString } from "/imports/plugins/core/tags/lib/queries";
import TestApp from "../TestApp";
import Factory from "/imports/test-utils/helpers/factory";

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM=";
const shopName = "Test Shop";
const internalAdminAccountId = "456";

const mockTagWithFeatured = Factory.Tag.makeOne({
  featuredProductIds: ["110", "111", "112", "113", "114"],
  shopId: internalShopId
});

const mockProductsWithTagAndFeaturedProducts = Factory.Product.makeMany(77, {
  _id: (iterator) => (iterator + 100).toString(),
  isDeleted: false,
  isVisible: true,
  hashtags: [mockTagWithFeatured._id],
  shopId: internalShopId
});

const mockAdminAccount = Factory.Accounts.makeOne({
  _id: internalAdminAccountId
});

jest.setTimeout(300000);

let testApp;
let query;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  query = testApp.query(tagProductsQueryString);
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await testApp.createUserAndAccount(mockAdminAccount, ["owner"]);
  await testApp.setLoggedInUser(mockAdminAccount);
  await testApp.collections.Tags.insertOne(mockTagWithFeatured);
  await Promise.all(mockProductsWithTagAndFeaturedProducts.map((mockProduct) => testApp.collections.Products.insertOne(mockProduct)));
});

afterAll(async () => {
  await testApp.collections.Shops.deleteOne({ _id: internalShopId });
  await testApp.collections.Tags.deleteOne({ _id: mockTagWithFeatured._id });
  await Promise.all(mockProductsWithTagAndFeaturedProducts.map((mockProduct) => testApp.collections.Products.deleteOne({ _id: mockProduct._id })));
  await testApp.clearLoggedInUser();
  testApp.stop();
});

test("get all 77 products with a certain tag", async () => {
  let result;
  try {
    result = await query({ shopId: opaqueShopId, tagId: encodeTagOpaqueId(mockTagWithFeatured._id), limit: 77 });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.productsByTagId.pageInfo.hasNextPage).toEqual(false);
  expect(result.productsByTagId.pageInfo.hasPreviousPage).toEqual(false);
  expect(result.productsByTagId.nodes.length).toEqual(77);
});

test("get all products with a certain tag", async () => {
  let result;
  try {
    result = await query({ shopId: opaqueShopId, tagId: encodeTagOpaqueId(mockTagWithFeatured._id) });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.productsByTagId.pageInfo.hasNextPage).toEqual(true);
  expect(result.productsByTagId.pageInfo.hasPreviousPage).toEqual(false);
  expect(result.productsByTagId.nodes.length).toEqual(20);
});

test("get all products with a certain tag, sorted by Featured", async () => {
  let result;
  try {
    result = await query({ shopId: opaqueShopId, tagId: encodeTagOpaqueId(mockTagWithFeatured._id) });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.productsByTagId.nodes[0]._id).toEqual("110");
  expect(result.productsByTagId.nodes[1]._id).toEqual("111");
  expect(result.productsByTagId.nodes[2]._id).toEqual("112");
  expect(result.productsByTagId.nodes[3]._id).toEqual("113");
  expect(result.productsByTagId.nodes[4]._id).toEqual("114");
  expect(result.productsByTagId.nodes[0].position).toEqual(0);
  expect(result.productsByTagId.nodes[1].position).toEqual(1);
  expect(result.productsByTagId.nodes[2].position).toEqual(2);
  expect(result.productsByTagId.nodes[3].position).toEqual(3);
  expect(result.productsByTagId.nodes[4].position).toEqual(4);
  expect(result.productsByTagId.nodes[5].position).toEqual(-1);
  expect(result.productsByTagId.nodes[10].position).toEqual(-1);
});

test("get products with a certain tag, on the first page", async () => {
  let result;
  try {
    result = await query({
      shopId: opaqueShopId,
      tagId: encodeTagOpaqueId(mockTagWithFeatured._id),
      page: 0
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.productsByTagId.nodes.length).toEqual(20);
  expect(result.productsByTagId.pageInfo.hasNextPage).toEqual(true);
  expect(result.productsByTagId.pageInfo.hasPreviousPage).toEqual(false);
});

test("get products with a certain tag, on the second page", async () => {
  let result;
  try {
    result = await query({
      shopId: opaqueShopId,
      tagId: encodeTagOpaqueId(mockTagWithFeatured._id),
      page: 1
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.productsByTagId.nodes.length).toEqual(20);
  expect(result.productsByTagId.pageInfo.hasNextPage).toEqual(true);
  expect(result.productsByTagId.pageInfo.hasPreviousPage).toEqual(true);
});

test("get products with a certain tag, on the second to last page", async () => {
  let result;
  try {
    result = await query({
      shopId: opaqueShopId,
      tagId: encodeTagOpaqueId(mockTagWithFeatured._id),
      page: 6,
      limit: 10
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.productsByTagId.nodes.length).toEqual(10);
  expect(result.productsByTagId.pageInfo.hasNextPage).toEqual(true);
  expect(result.productsByTagId.pageInfo.hasPreviousPage).toEqual(true);
});

test("gets products on the last page", async () => {
  let totalQuery;
  let result;
  try {
    totalQuery = await query({ shopId: opaqueShopId, tagId: encodeTagOpaqueId(mockTagWithFeatured._id), limit: 77 });
    result = await query({
      shopId: opaqueShopId,
      tagId: encodeTagOpaqueId(mockTagWithFeatured._id),
      // after: firstQuery.productsByTagId.pageInfo.endCursor,
      page: 7,
      limit: 10
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(totalQuery.productsByTagId.nodes.length).toEqual(77);
  expect(result.productsByTagId.nodes.length).toEqual(7);
  expect(result.productsByTagId.pageInfo.hasPreviousPage).toEqual(true);
  expect(result.productsByTagId.pageInfo.hasNextPage).toEqual(false);
});

test("gets products beyond the last page", async () => {
  let totalQuery;
  let result;
  try {
    totalQuery = await query({ shopId: opaqueShopId, tagId: encodeTagOpaqueId(mockTagWithFeatured._id), limit: 77 });
    // Go beyond the final page
    result = await query({
      shopId: opaqueShopId,
      tagId: encodeTagOpaqueId(mockTagWithFeatured._id),
      page: 8,
      limit: 10
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(totalQuery.productsByTagId.nodes.length).toEqual(77);
  expect(result.productsByTagId.nodes.length).toEqual(0);
  expect(result.productsByTagId.pageInfo.hasPreviousPage).toEqual(false);
  expect(result.productsByTagId.pageInfo.hasNextPage).toEqual(false);
});
