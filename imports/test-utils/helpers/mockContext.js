const mockContext = {
  collections: {},
  shopId: "FAKE_SHOP_ID",
  userHasPermission: jest.fn().mockName("userHasPermission"),
  userId: "FAKE_USER_ID"
};

[
  "Accounts",
  "Assets",
  "Cart",
  "Catalog",
  "Emails",
  "Groups",
  "Inventory",
  "Logs",
  "MediaRecords",
  "Notifications",
  "Orders",
  "Packages",
  "Products",
  "Revisions",
  "roles",
  "SellerShops",
  "Shipping",
  "Shops",
  "Sms",
  "Tags",
  "Templates",
  "Themes",
  "Translations",
  "users"
].forEach((collectionName) => {
  mockContext.collections[collectionName] = {
    find: jest.fn().mockName(`${collectionName}.find`).mockReturnThis(),
    findOne: jest.fn().mockName(`${collectionName}.findOne`),
    toArray: jest.fn().mockName(`${collectionName}.toArray`),
    update: jest.fn().mockName(`${collectionName}.update`)
  };
});

export default mockContext;
