import rolesResolver from "./roles";
import getFakeMongoCursor from "/imports/test-utils/helpers/getFakeMongoCursor";

const base64ID = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123

const mockRoles = [
  { _id: "a1", name: "admin" },
  { _id: "b2", name: "foo" },
  { _id: "c3", name: "bar" }
];

const mockRolesQuery = getFakeMongoCursor("Tags", mockRoles);

test("calls queries.accounts.roles and returns a partial connection", async () => {
  const roles = jest.fn().mockName("queries.accounts.roles").mockReturnValueOnce(Promise.resolve(mockRolesQuery));

  const result = await rolesResolver({ _id: base64ID }, {}, {
    queries: { accounts: { roles } }
  });

  expect(result).toEqual({
    nodes: mockRoles,
    pageInfo: {
      endCursor: "c3",
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: "a1"
    },
    totalCount: 3
  });

  expect(roles).toHaveBeenCalled();
  expect(roles.mock.calls[0][1]).toBe("123");
});
