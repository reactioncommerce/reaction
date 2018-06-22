import GraphTester from "../GraphTester";
import Factory from "/imports/test-utils/helpers/factory";

jasmine.DEFAULT_TIMEOUT_INTERVAL = 60000;

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const shopName = "Test Shop";
const mockTags = Factory.Tag.makeMany(55, { shopId: internalShopId, _id: (i) => (i + 100).toString(), position: (i) => i + 100 });

const tagsQuery = `($shopId: ID!, $after: ConnectionCursor, $before: ConnectionCursor, $first: ConnectionLimitInt, $last: ConnectionLimitInt) {
  tags(shopId: $shopId, after: $after, before: $before, first: $first, last: $last) {
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

let tester;
let query;
beforeAll(async () => {
  tester = new GraphTester();
  await tester.start();
  query = tester.query(tagsQuery);

  await tester.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await Promise.all(mockTags.map((tag) => tester.collections.Tags.insert(tag)));
});

afterAll(() => tester.stop());

test("get the first 20 tags when neither first or last is in query", async () => {
  let result;
  try {
    result = await query({ shopId: opaqueShopId });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.tags.nodes.length).toBe(20);
  expect(result.tags.totalCount).toBe(55);
  expect(result.tags.pageInfo).toEqual({ endCursor: "MTE5", hasNextPage: true, hasPreviousPage: false, startCursor: "MTAw" });

  try {
    result = await query({ shopId: opaqueShopId, after: result.tags.pageInfo.endCursor });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.tags.nodes.length).toBe(20);
  expect(result.tags.totalCount).toBe(55);
  expect(result.tags.pageInfo).toEqual({ endCursor: "MTM5", hasNextPage: true, hasPreviousPage: true, startCursor: "MTIw" });

  try {
    result = await query({ shopId: opaqueShopId, after: result.tags.pageInfo.endCursor });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.tags.nodes.length).toBe(15);
  expect(result.tags.totalCount).toBe(55);
  expect(result.tags.pageInfo).toEqual({ endCursor: "MTU0", hasNextPage: false, hasPreviousPage: true, startCursor: "MTQw" });

  // Ensure it's also correct when we pass `first: 5` explicitly
  try {
    result = await query({ shopId: opaqueShopId, after: "MTQ5", first: 5 });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.tags.nodes.length).toBe(5);
  expect(result.tags.totalCount).toBe(55);
  expect(result.tags.pageInfo).toEqual({ endCursor: "MTU0", hasNextPage: false, hasPreviousPage: true, startCursor: "MTUw" });
});

test("get the last 10 tags when last is in query and before last item in list", async () => {
  let result;
  try {
    result = await query({ shopId: opaqueShopId, last: 10, before: "MTU0" });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.tags.nodes.length).toBe(10);
  expect(result.tags.totalCount).toBe(55);
  expect(result.tags.pageInfo).toEqual({ endCursor: "MTUz", hasNextPage: true, hasPreviousPage: true, startCursor: "MTQ0" });

  try {
    result = await query({ shopId: opaqueShopId, last: 10, before: result.tags.pageInfo.startCursor });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.tags.nodes.length).toBe(10);
  expect(result.tags.totalCount).toBe(55);
  expect(result.tags.pageInfo).toEqual({ endCursor: "MTQz", hasNextPage: true, hasPreviousPage: true, startCursor: "MTM0" });

  try {
    result = await query({ shopId: opaqueShopId, last: 34, before: result.tags.pageInfo.startCursor });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.tags.nodes.length).toBe(34);
  expect(result.tags.totalCount).toBe(55);
  expect(result.tags.pageInfo).toEqual({ endCursor: "MTMz", hasNextPage: true, hasPreviousPage: false, startCursor: "MTAw" });
});

test("works correctly when last goes before start", async () => {
  let result;
  try {
    result = await query({ shopId: opaqueShopId, last: 5, before: "MTAw" });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.tags.nodes.length).toBe(0);
  expect(result.tags.totalCount).toBe(55);
  expect(result.tags.pageInfo).toEqual({ endCursor: null, hasNextPage: true, hasPreviousPage: false, startCursor: null });
});
