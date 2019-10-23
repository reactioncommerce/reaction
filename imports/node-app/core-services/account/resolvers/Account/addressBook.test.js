import addressBookResolver from "./addressBook.js";

const addressBook = [
  { _id: "123", address1: "123 Main St" },
  { _id: "456", address1: "456 Sesame St" }
];

const testAccount = { profile: { addressBook } };

test("converts the addressBook prop on an account to a connection", async () => {
  const result = await addressBookResolver(testAccount, {});
  expect(result).toEqual({
    edges: [
      {
        cursor: "YXJyYXljb25uZWN0aW9uOjA=",
        node: addressBook[0]
      }, {
        cursor: "YXJyYXljb25uZWN0aW9uOjE=",
        node: addressBook[1]
      }
    ],
    nodes: addressBook,
    pageInfo: {
      endCursor: "YXJyYXljb25uZWN0aW9uOjE=",
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: "YXJyYXljb25uZWN0aW9uOjA="
    },
    totalCount: 2
  });
});
