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

const tagsQuery = `($shopId: ID!, $after: ConnectionCursor) {
  tags(shopId: $shopId, after: $after) {
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
});

afterAll(() => tester.stopServer());

test("get the first 50 tags when neither first or last is in query", async () => {
  await tester.collections.Shops.insert({ _id: internalShopId, name: shopName });
  await Promise.all(tags.map((tag) => tester.collections.Tags.insert(tag)));

  let result;
  try {
    result = await query({ shopId: opaqueShopId });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  result.tags.nodes.forEach((tag, i) => console.log("tags", tag.position))

  expect(result.tags.nodes.length).toBe(50);
  expect(result.tags.totalCount).toBe(55);
  expect(result.tags.pageInfo).toEqual({ endCursor: "MTQ5", hasNextPage: true, hasPreviousPage: false, startCursor: "MTAw" });

  try {
    result = await query({ shopId: opaqueShopId, after: result.tags.pageInfo.endCursor });
  } catch (error) {
    expect(error).toBeUndefined();
    return;
  }

  result.tags.nodes.forEach((tag, i) => console.log("tags", tag.position))

  expect(result.tags.nodes.length).toBe(5);
  expect(result.tags.totalCount).toBe(55);
  expect(result.tags.pageInfo).toEqual({ endCursor: "MTU0", hasNextPage: false, hasPreviousPage: false, startCursor: "MTUw" });
});
