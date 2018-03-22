import groups from "./groups";
import getFakeMongoCursor from "/imports/test-utils/helpers/getFakeMongoCursor";

jest.mock("graphql-fields", () => jest.fn().mockName("graphqlFields"));

const base64ID = "cmVhY3Rpb24vc2hvcDpzMTIz"; // reaction/shop:s123

test("calls queries.groups with a shopId and retuns groups", async () => {
  const groupsQuery = jest.fn().mockName("groupsQuery").mockReturnValueOnce(getFakeMongoCursor("Groups", [{
    _id: "dLKH5uPjTTGK2qrWH",
    name: "shop manager",
    slug: "shop manager",
    permissions: [
      "core",
      "createProduct",
      "dashboard"
    ],
    shopId: "s123",
    createdAt: "2018-03-21T21:36:36.307Z",
    updatedAt: "2018-03-22T18:17:22.342Z"
  }]));

  const result = await groups(null, { shopId: base64ID }, {
    queries: { groups: groupsQuery },
    userId: "123"
  });

  expect(result.nodes[0].shopId).toEqual("s123");
  expect(groupsQuery).toHaveBeenCalled();
});
