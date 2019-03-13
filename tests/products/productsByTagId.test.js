import { encodeTagOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/tag";
import ProductsByTagIdQuery from "./ProductsByTagQuery.graphql";
import TestApp from "../TestApp";
import Factory from "/imports/test-utils/helpers/factory";

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM=";
const shopName = "Test Shop";

const mockTagWithFeatured = Factory.Tag.makeOne({
  featuredProductIds: ["110", "111", "112", "113", "114"],
  shopId: internalShopId
});

const mockProductsWithTagAndFeaturedProducts = Factory.Product.makeMany(77, {
  _id: (iterator) => (iterator + 100).toString(),
  isDeleted: false,
  isVisible: true,
  tagIds: [mockTagWithFeatured._id],
  shopId: internalShopId
});

const productsQuery = `query getProductsByTagId($shopId: ID!, $after: ConnectionCursor, $before: ConnectionCursor, $first: ConnectionLimitInt, $last: ConnectionLimitInt) {
  productsByTagId(shopId: $shopId, after: $after, before: $before, first: $first, last: $last) {
    totalCount
    pageInfo {
      hasNextPage
      hasPreviousPage
      startCursor
      endCursor
    }
    nodes {
      _id
      position
    }
  }
}`;

jest.setTimeout(300000);

let testApp;
let query;

beforeAll(async () => {
  testApp = new TestApp();
  await testApp.start();
  query = testApp.query(productsQuery);
  await testApp.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await testApp.collections.Tags.insertOne(mockTagWithFeatured);
  await Promise.all(mockProductsWithTagAndFeaturedProducts.map((mockProduct) => testApp.collections.Products.insertOne(mockProduct)));
});

afterAll(async () => {
  await testApp.collections.Shops.deleteOne({ _id: internalShopId });
  await testApp.collections.Tags.deleteOne({ _id: mockTagWithFeatured._id });
  await Promise.all(mockProductsWithTagAndFeaturedProducts.map((mockProduct) => testApp.collections.Products.deleteOne({ _id: mockProduct._id })));
  testApp.stop();
});

test("get all products with a certain tag", async () => {
  let result;
  try {
    result = await query({ shopId: opaqueShopId, tagId: encodeTagOpaqueId(mockTagWithFeatured._id) });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }
  expect(result.catalogItems.totalCount).toEqual(77);
  expect(result.catalogItems.pageInfo.hasNextPage).toEqual(true);
  expect(result.catalogItems.pageInfo.hasPreviousPage).toEqual(false);
  expect(result.catalogItems.edges.length).toEqual(20);
});
