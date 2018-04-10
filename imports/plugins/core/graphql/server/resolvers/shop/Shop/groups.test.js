import groupsResolver from "./groups";
import getFakeMongoCursor from "/imports/test-utils/helpers/getFakeMongoCursor";

const base64ID = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123

const mockGroups = [
  { _id: "a1", name: "admin" },
  { _id: "b2", name: "foo" },
  { _id: "c3", name: "bar" }
];

const mockGroupsQuery = getFakeMongoCursor("Groups", mockGroups);

test("calls queries.groups and returns a partial connection", async () => {
  const groups = jest.fn().mockName("queries.groups").mockReturnValueOnce(Promise.resolve(mockGroupsQuery));

  const result = await groupsResolver({ _id: base64ID }, {}, {
    queries: { groups }
  });

  expect(result).toEqual({
    nodes: mockGroups,
    pageInfo: {
      endCursor: "c3",
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: "a1"
    },
    totalCount: 3
  });

  expect(groups).toHaveBeenCalled();
  expect(groups.mock.calls[0][1]).toBe("123");
});
