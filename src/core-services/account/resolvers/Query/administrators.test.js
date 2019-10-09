import getFakeMongoCursor from "@reactioncommerce/api-utils/tests/getFakeMongoCursor.js";
import administratorsResolver from "./administrators.js";

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

  const result = await administratorsResolver(null, { shopId: base64ID }, {
    queries: { shopAdministrators },
    userId: "999"
  }, { fieldNodes: [] });

  expect(result).toEqual({
    nodes: mockAccounts,
    pageInfo: {
      endCursor: "c3",
      startCursor: "a1"
    },
    totalCount: null
  });

  expect(shopAdministrators).toHaveBeenCalled();
  expect(shopAdministrators.mock.calls[0][1]).toBe("123");
});
