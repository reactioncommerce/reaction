import GraphTester from "../GraphTester";

const internalShopId = "123";
const opaqueShopId = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123
const shopName = "Test Shop";
const tags = [];
for (let i = 100; i < 155; i += 1) {
  const tagName = i.toString();
  const tagId = i.toString();
  const tagPosition = i;
  tags.push({ _id: tagId, name: tagName, shopId: internalShopId, position: tagPosition });
}

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
  await tester.startServer();
  query = tester.query(tagsQuery);

  await tester.insertPrimaryShop({ _id: internalShopId, name: shopName });
  await Promise.all(tags.map((tag) => tester.collections.Tags.insert(tag)));
});

afterAll(() => tester.stopServer());

test("get the first 50 tags when neither first or last is in query", async () => {
  let result;
  try {
    result = await query({ shopId: opaqueShopId });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.tags.nodes.length).toBe(50);
  expect(result.tags.totalCount).toBe(55);
  expect(result.tags.pageInfo).toEqual({ endCursor: "MTQ5", hasNextPage: true, hasPreviousPage: false, startCursor: "MTAw" });

  try {
    result = await query({ shopId: opaqueShopId, after: result.tags.pageInfo.endCursor });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  expect(result.tags.nodes.length).toBe(5);
  expect(result.tags.totalCount).toBe(55);
  expect(result.tags.pageInfo).toEqual({ endCursor: "MTU0", hasNextPage: false, hasPreviousPage: false, startCursor: "MTUw" });
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
  expect(result.tags.pageInfo).toEqual({ endCursor: "MTUz", hasNextPage: false, hasPreviousPage: true, startCursor: "MTQ0" });
});
