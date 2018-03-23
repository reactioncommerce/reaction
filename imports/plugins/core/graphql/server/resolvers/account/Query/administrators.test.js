import { xformAccountResponse } from "@reactioncommerce/reaction-graphql-xforms/account";
import administratorsResolver from "./administrators";

const base64ID = "cmVhY3Rpb24vc2hvcDoxMjM="; // reaction/shop:123

function getFakeMongoCursor(collectionName, results) {
  const cursor = {
    clone: () => ({
      count: () => results.length
    }),
    cmd: {
      query: {}
    },
    filter: () => cursor,
    limit: () => cursor,
    ns: `meteor.${collectionName}`,
    options: {
      db: {
        collection: () => ({
          findOne: () => Promise.resolve(null)
        }),
        databaseName: "meteor"
      }
    },
    skip: () => cursor,
    sort: () => cursor,
    toArray() {
      return Promise.resolve(results);
    }
  };
  return cursor;
}

const mockAccounts = [
  { _id: "a1", name: "Owner" },
  { _id: "b2", name: "Admin 1" },
  { _id: "c3", name: "Admin 2" }
];

const mockAdministratorsQuery = getFakeMongoCursor("Accounts", mockAccounts);

const transformedAccounts = mockAccounts.map(xformAccountResponse);

test("calls queries.shopAdministrators and returns a partial connection", async () => {
  const shopAdministrators = jest.fn().mockName("shopAdministrators")
    .mockReturnValueOnce(Promise.resolve(mockAdministratorsQuery));

  const result = await administratorsResolver(null, { shopId: base64ID }, {
    queries: { shopAdministrators },
    userId: "999"
  });

  expect(result).toEqual({
    nodes: transformedAccounts,
    pageInfo: {
      endCursor: "cmVhY3Rpb24vYWNjb3VudDpjMw==",
      hasNextPage: null,
      hasPreviousPage: null,
      startCursor: "cmVhY3Rpb24vYWNjb3VudDphMQ=="
    },
    totalCount: 3
  });

  expect(shopAdministrators).toHaveBeenCalled();
  expect(shopAdministrators.mock.calls[0][1]).toBe("123");
});
