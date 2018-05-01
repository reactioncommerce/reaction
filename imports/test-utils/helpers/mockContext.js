const mockContext = {
  collections: {},
  shopId: "FAKE_SHOP_ID",
  userHasPermission: jest.fn().mockName("userHasPermission"),
  userId: "FAKE_USER_ID"
};

[
  "Accounts",
  "Catalog",
  "Groups",
  "roles",
  "Shops",
  "Tags",
  "users"
].forEach((collectionName) => {
  mockContext.collections[collectionName] = {
    find: jest.fn().mockName(`${collectionName}.find`),
    findOne: jest.fn().mockName(`${collectionName}.findOne`)
  };
});

export default mockContext;
