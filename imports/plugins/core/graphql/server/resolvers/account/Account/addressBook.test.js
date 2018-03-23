import addressBookResolver from "./addressBook";

const addressBook = [
  { _id: "123", address1: "123 Main St" },
  { _id: "456", address1: "456 Sesame St" }
];

const testAccount = { addressBook };

const transformedAddressBook = [
  {
    _id: "cmVhY3Rpb24vYWRkcmVzczoxMjM=",
    address1: "123 Main St"
  }, {
    _id: "cmVhY3Rpb24vYWRkcmVzczo0NTY=",
    address1: "456 Sesame St"
  }
];

test("converts the addressBook prop on an account to a connection", async () => {
  const result = await addressBookResolver(testAccount, {});
  expect(result).toEqual({
    edges: [
      {
        cursor: "YXJyYXljb25uZWN0aW9uOjA=",
        node: transformedAddressBook[0]
      }, {
        cursor: "YXJyYXljb25uZWN0aW9uOjE=",
        node: transformedAddressBook[1]
      }
    ],
    nodes: transformedAddressBook,
    pageInfo: {
      endCursor: "YXJyYXljb25uZWN0aW9uOjE=",
      hasNextPage: false,
      hasPreviousPage: false,
      startCursor: "YXJyYXljb25uZWN0aW9uOjA="
    }
  });
});
