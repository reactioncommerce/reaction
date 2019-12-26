import getFakeMongoCursor from "@reactioncommerce/api-utils/tests/getFakeMongoCursor.js";
import groupsResolver from "./groups.js";

const shopId = "123";

const mockGroups = [
  { _id: "a1", name: "admin" },
  { _id: "b2", name: "foo" },
  { _id: "c3", name: "bar" }
];

const mockGroupsQuery = getFakeMongoCursor("Groups", mockGroups);

test("calls queries.groups and returns a partial connection", async () => {
  const groups = jest.fn().mockName("queries.groups").mockReturnValueOnce(Promise.resolve(mockGroupsQuery));

  const context = {
    queries: { groups }
  };

  const result = await groupsResolver({ _id: shopId }, {}, context, { fieldNodes: [] });

  expect(result).toEqual({
    nodes: mockGroups,
    pageInfo: {
      endCursor: "c3",
      startCursor: "a1"
    },
    totalCount: null
  });

  expect(groups).toHaveBeenCalledWith(context, shopId);
});
