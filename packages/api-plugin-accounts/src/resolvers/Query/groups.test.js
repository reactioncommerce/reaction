import getFakeMongoCursor from "@reactioncommerce/api-utils/tests/getFakeMongoCursor.js";
import groups from "./groups.js";

jest.mock("graphql-fields", () => jest.fn().mockName("graphqlFields"));

const shopBase64ID = "cmVhY3Rpb24vc2hvcDpzMTIz"; // reaction/shop:s123

const groupsData = [
  {
    _id: "g1",
    name: "Shop Manager",
    slug: "shop-manager",
    permissions: [
      "core",
      "admin",
      "createProduct",
      "dashboard"
    ],
    shopId: "s123",
    createdAt: "2018-03-21T21:36:36.307Z",
    updatedAt: "2018-03-22T18:17:22.342Z"
  },
  {
    _id: "g2",
    name: "Product Manager",
    slug: "product-manager",
    permissions: [
      "core",
      "createProduct",
      "dashboard"
    ],
    shopId: "s123",
    createdAt: "2018-03-21T21:36:36.307Z",
    updatedAt: "2018-03-22T18:17:22.342Z"
  },
  {
    _id: "g3",
    name: "Order Fulfilment",
    slug: "shop manager",
    permissions: [
      "dashboard",
      "orders"
    ],
    shopId: "s123",
    createdAt: "2018-03-21T21:36:36.307Z",
    updatedAt: "2018-03-22T18:17:22.342Z"
  }
];

test("calls queries.groups with a shopId and returns groups", async () => {
  const groupsQuery = jest.fn().mockName("queries.groups").mockReturnValueOnce(getFakeMongoCursor("Groups", groupsData));

  const result = await groups(null, { shopId: shopBase64ID }, {
    queries: { groups: groupsQuery },
    userId: "123"
  });

  expect(result.nodes).toEqual(groupsData);
  expect(groupsQuery).toHaveBeenCalled();
});
