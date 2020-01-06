import getFakeMongoCursor from "@reactioncommerce/api-utils/tests/getFakeMongoCursor.js";
import administratorsResolver from "./administrators.js";

const shopId = "123";

const mockAccounts = [
  { _id: "a1", name: "Owner" },
  { _id: "b2", name: "Admin 1" },
  { _id: "c3", name: "Admin 2" }
];

const mockAdministratorsQuery = getFakeMongoCursor("Accounts", mockAccounts);

test("calls queries.shopAdministrators and returns a partial connection", async () => {
  const shopAdministrators = jest.fn().mockName("queries.shopAdministrators")
    .mockReturnValueOnce(Promise.resolve(mockAdministratorsQuery));

  const context = {
    queries: { shopAdministrators },
    userId: "999"
  };

  const result = await administratorsResolver({ _id: shopId }, {}, context, { fieldNodes: [] });

  expect(result).toEqual({
    nodes: mockAccounts,
    pageInfo: {
      endCursor: "c3",
      startCursor: "a1"
    },
    totalCount: null
  });

  expect(shopAdministrators).toHaveBeenCalledWith(context, shopId);
});
