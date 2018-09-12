import administratorsResolver from "./administrators";
import getFakeMongoCursor from "/imports/test-utils/helpers/getFakeMongoCursor";

const base64ID = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123

const mockAccounts = [
  { _id: "a1", name: "Owner" },
  { _id: "b2", name: "Admin 1" },
  { _id: "c3", name: "Admin 2" }
];

const mockAdministratorsQuery = getFakeMongoCursor("Accounts", mockAccounts);

test("calls queries.shopAdministrators and returns a partial connection", async () => {
  const shopAdministrators = jest.fn().mockName("queries.shopAdministrators")
    .mockReturnValueOnce(Promise.resolve(mockAdministratorsQuery));

  const result = await administratorsResolver({ _id: base64ID }, {}, {
    queries: { shopAdministrators },
    userId: "999"
  });

  expect(result).toEqual({
    nodes: mockAccounts,
    pageInfo: {
      endCursor: "c3",
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: "a1"
    },
    totalCount: 3
  });

  expect(shopAdministrators).toHaveBeenCalled();
  expect(shopAdministrators.mock.calls[0][1]).toBe("123");
});
