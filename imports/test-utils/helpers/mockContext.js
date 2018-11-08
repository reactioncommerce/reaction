const mockContext = {
  accountId: "FAKE_ACCOUNT_ID",
  appEvents: {
    emit() {},
    on() {}
  },
  collections: {},
  getFunctionsOfType: jest.fn().mockName("getFunctionsOfType").mockReturnValue([]),
  shopId: "FAKE_SHOP_ID",
  userHasPermission: jest.fn().mockName("userHasPermission"),
  userId: "FAKE_USER_ID"
};

export function mockCollection(collectionName) {
  return {
    insert() {
      throw new Error("insert mongo method is deprecated, use insertOne or insertMany");
    },
    remove() {
      throw new Error("remove mongo method is deprecated, use deleteOne or deleteMany");
    },
    update() {
      throw new Error("update mongo method is deprecated, use updateOne or updateMany");
    },
    deleteOne: jest.fn().mockName(`${collectionName}.deleteOne`).mockReturnValue(Promise.resolve({
      deletedCount: 1
    })),
    deleteMany: jest.fn().mockName(`${collectionName}.deleteMany`),
    find: jest
      .fn()
      .mockName(`${collectionName}.find`)
      .mockReturnThis(),
    findOne: jest.fn().mockName(`${collectionName}.findOne`),
    insertOne: jest.fn().mockName(`${collectionName}.insertOne`),
    insertMany: jest.fn().mockName(`${collectionName}.insertMany`),
    toArray: jest.fn().mockName(`${collectionName}.toArray`),
    updateOne: jest.fn().mockName(`${collectionName}.updateOne`).mockReturnValue(Promise.resolve({
      matchedCount: 1,
      modifiedCount: 1
    })),
    updateMany: jest.fn().mockName(`${collectionName}.updateMany`)
  };
}

[
  "Accounts",
  "Assets",
  "Cart",
  "Catalog",
  "Emails",
  "Groups",
  "Inventory",
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
  "Tags",
  "Templates",
  "Themes",
  "Translations",
  "users"
].forEach((collectionName) => {
  mockContext.collections[collectionName] = mockCollection(collectionName);
});

mockContext.collections.Media = {
  find: jest.fn().mockName("Media.find"),
  findLocal: jest.fn().mockName("Media.findLocal"),
  findOne: jest.fn().mockName("Media.findOne"),
  findOneLocal: jest.fn().mockName("Media.findOneLocal"),
  insert: jest.fn().mockName("Media.insert"),
  update: jest.fn().mockName("Media.update"),
  remove: jest.fn().mockName("Media.remove")
};

export default mockContext;
