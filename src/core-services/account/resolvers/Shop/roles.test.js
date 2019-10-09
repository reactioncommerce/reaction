import getFakeMongoCursor from "@reactioncommerce/api-utils/tests/getFakeMongoCursor.js";
import rolesResolver from "./roles.js";

const base64ID = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123

const mockRoles = [
  { _id: "a1", name: "admin" },
  { _id: "b2", name: "foo" },
  { _id: "c3", name: "bar" }
];

const mockRolesQuery = getFakeMongoCursor("Tags", mockRoles);

test("calls queries.roles and returns a partial connection", async () => {
  const roles = jest.fn().mockName("queries.roles").mockReturnValueOnce(Promise.resolve(mockRolesQuery));

  const result = await rolesResolver({ _id: base64ID }, {}, {
    queries: { roles }
  }, { fieldNodes: [] });

  expect(result).toEqual({
    nodes: mockRoles,
    pageInfo: {
      endCursor: "c3",
      startCursor: "a1"
    },
    totalCount: null
  });

  expect(roles).toHaveBeenCalled();
  expect(roles.mock.calls[0][1]).toBe("123");
});
