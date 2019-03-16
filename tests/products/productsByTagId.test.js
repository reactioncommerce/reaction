import { encodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";
// import ProductsByTagIdQuery from "./ProductsByTagQuery.graphql";
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
    result = await query({ shopId: opaqueShopId, tagId: encodeTagOpaqueId(mockTagWithFeatured._id), first: 77 });
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

test("get all products with a certain tag, after the previous endCursor", async () => {
  let firstQuery;
  let secondQuery;
  try {
    firstQuery = await query({ shopId: opaqueShopId, tagId: encodeTagOpaqueId(mockTagWithFeatured._id) });
    secondQuery = await query({
      shopId: opaqueShopId,
      tagId: encodeTagOpaqueId(mockTagWithFeatured._id),
      after: firstQuery.productsByTagId.pageInfo.endCursor
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(secondQuery.productsByTagId.nodes.length).toEqual(20);
  expect(secondQuery.productsByTagId.pageInfo.hasNextPage).toEqual(true);
  expect(secondQuery.productsByTagId.pageInfo.hasPreviousPage).toEqual(true);
});

test("get all products with a certain tag, after the previous endCursor", async () => {
  let firstQuery;
  let secondQuery;
  try {
    firstQuery = await query({
      shopId: opaqueShopId,
      tagId: encodeTagOpaqueId(mockTagWithFeatured._id),
      first: 70
    });
    secondQuery = await query({
      shopId: opaqueShopId,
      tagId: encodeTagOpaqueId(mockTagWithFeatured._id),
      after: firstQuery.productsByTagId.pageInfo.endCursor
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(secondQuery.productsByTagId.nodes.length).toEqual(7);
  expect(secondQuery.productsByTagId.pageInfo.hasNextPage).toEqual(false);
  expect(secondQuery.productsByTagId.pageInfo.hasPreviousPage).toEqual(true);
});

test("get all products with a certain tag, after the previous endCursor with a first", async () => {
  let totalQuery;
  let firstQuery;
  let secondQuery;
  try {
    totalQuery = await query({ shopId: opaqueShopId, tagId: encodeTagOpaqueId(mockTagWithFeatured._id), first: 77 });
    firstQuery = await query({
      shopId: opaqueShopId,
      tagId: encodeTagOpaqueId(mockTagWithFeatured._id),
      first: 10
    });
    // Skip the first 10 by starting from the after endCursor of the firstQuery, which queried for the first 10 items
    secondQuery = await query({
      shopId: opaqueShopId,
      tagId: encodeTagOpaqueId(mockTagWithFeatured._id),
      after: firstQuery.productsByTagId.pageInfo.endCursor, // "MTA0" => atob("MTA0") => endCursor's node has an id of 104
      first: 20
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(totalQuery.productsByTagId.nodes.length).toEqual(77);
  expect(firstQuery.productsByTagId.nodes.length).toEqual(10);
  expect(secondQuery.productsByTagId.nodes.length).toEqual(20);
  expect(secondQuery.productsByTagId.pageInfo.hasNextPage).toEqual(true);
  expect(secondQuery.productsByTagId.pageInfo.hasPreviousPage).toEqual(true);
  // Test that the secondQuery skips the first 10, by adding 10 and checking against the totalQuery
  expect(secondQuery.productsByTagId.nodes[0]).toEqual(totalQuery.productsByTagId.nodes[0 + 10]);
  expect(secondQuery.productsByTagId.nodes[5]).toEqual(totalQuery.productsByTagId.nodes[5 + 10]);
  expect(secondQuery.productsByTagId.nodes[19]).toEqual(totalQuery.productsByTagId.nodes[19 + 10]);
});

test("get the last 30 products with a certain tag", async () => {
  let totalQuery;
  let lastQuery;
  try {
    totalQuery = await query({ shopId: opaqueShopId, tagId: encodeTagOpaqueId(mockTagWithFeatured._id), first: 77 });
    lastQuery = await query({
      shopId: opaqueShopId,
      tagId: encodeTagOpaqueId(mockTagWithFeatured._id),
      last: 30
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  const lastQueryLength = lastQuery.productsByTagId.nodes.length;
  const totalQueryLength = totalQuery.productsByTagId.nodes.length;
  expect(lastQuery.productsByTagId.nodes.length).toEqual(30);
  expect(lastQuery.productsByTagId.pageInfo.hasNextPage).toEqual(false);
  expect(lastQuery.productsByTagId.pageInfo.hasPreviousPage).toEqual(true);
  expect(lastQuery.productsByTagId.nodes[lastQueryLength - 2]).toEqual(totalQuery.productsByTagId.nodes[totalQueryLength - 2]);
  expect(lastQuery.productsByTagId.nodes[lastQueryLength - 1]).toEqual(totalQuery.productsByTagId.nodes[totalQueryLength - 1]);
});

test("backwards pagination by getting all products with a certain tag, from the end", async () => {
  let totalQuery;
  let page5Query;
  let page4Query;
  try {
    totalQuery = await query({ shopId: opaqueShopId, tagId: encodeTagOpaqueId(mockTagWithFeatured._id), first: 77 });
    page5Query = await query({
      shopId: opaqueShopId,
      tagId: encodeTagOpaqueId(mockTagWithFeatured._id),
      last: 20
    });
    // Skip the last 20 by starting from the after endCursor of the firstQuery, which queried for the last 20 items
    page4Query = await query({
      shopId: opaqueShopId,
      tagId: encodeTagOpaqueId(mockTagWithFeatured._id),
      before: page5Query.productsByTagId.pageInfo.startCursor, // MTU3 => atob("MTU3") => id 157
      last: 20
    });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  const page5 = page5Query.productsByTagId.nodes;
  const page4 = page4Query.productsByTagId.nodes;
  expect(totalQuery.productsByTagId.nodes.length).toEqual(77);
  expect(page5.length).toEqual(20);
  expect(page4.length).toEqual(20);
  expect(page4Query.productsByTagId.pageInfo.hasNextPage).toEqual(true);
  const page4last = page4[page4.length - 1];
  expect(page4last._id).toEqual("156");
});
