import { xformGroupResponse } from "@reactioncommerce/reaction-graphql-xforms/group";
import groupsResolver from "./groups";
import getFakeMongoCursor from "/imports/test-utils/helpers/getFakeMongoCursor";

const base64ID = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123

const mockGroups = [
  { _id: "a1", name: "admin" },
  { _id: "b2", name: "foo" },
  { _id: "c3", name: "bar" }
];

const mockGroupsQuery = getFakeMongoCursor("Groups", mockGroups);

const transformedGroups = mockGroups.map(xformGroupResponse);

test("calls queries.tags and returns a partial connection", async () => {
  const groups = jest.fn().mockName("roles").mockReturnValueOnce(Promise.resolve(mockGroupsQuery));

  const result = await groupsResolver({ _id: base64ID }, {}, {
    queries: { groups }
  });

  expect(result).toEqual({
    nodes: transformedGroups,
    pageInfo: {
      endCursor: "cmVhY3Rpb24vZ3JvdXA6YzM=",
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: "cmVhY3Rpb24vZ3JvdXA6YTE="
    },
    totalCount: 3
  });

  expect(groups).toHaveBeenCalled();
  expect(groups.mock.calls[0][1]).toBe("123");
});
