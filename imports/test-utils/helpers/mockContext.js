const mockContext = {
  accountId: "FAKE_ACCOUNT_ID",
  appEvents: {
    emit() { },
    on() { }
  },
  auth: {
    accountByUserId: jest.fn().mockName("accountByUserId").mockImplementation((ctx, userId) => ctx.collections.Accounts.findOne({ userId })),
    getHasPermissionFunctionForUser: jest.fn().mockName("getHasPermissionFunctionForUser").mockImplementation(() => () => false),
    getShopsUserHasPermissionForFunctionForUser: jest.fn().mockName("getShopsUserHasPermissionForFunctionForUser").mockImplementation(() => () => [])
  },
  collections: {},
  getAbsoluteUrl: jest.fn().mockName("getAbsoluteUrl").mockImplementation((path) => {
    const adjustedPath = path[0] === "/" ? path : `/${path}`;
    return `https://app.mock${adjustedPath}`;
  }),
  getFunctionsOfType: jest.fn().mockName("getFunctionsOfType").mockReturnValue([]),
  mutations: {},
  queries: {},
  userHasPermission: jest.fn().mockName("userHasPermission"),
  userId: "FAKE_USER_ID"
};

/**
 * @summary Returns a mock collection instance with the given name
 * @param {String} collectionName The collection name
 * @returns {Object} Mock collection instance
 */
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
    bulkWrite: jest.fn().mockName(`${collectionName}.bulkWrite`).mockReturnValue(Promise.resolve({
      nMatched: 1,
      nModified: 1,
      result: {
        writeErrors: []
      }
    })),
    deleteOne: jest.fn().mockName(`${collectionName}.deleteOne`).mockReturnValue(Promise.resolve({
      deletedCount: 1
    })),
    deleteMany: jest.fn().mockName(`${collectionName}.deleteMany`),
    find: jest
      .fn()
      .mockName(`${collectionName}.find`)
      .mockReturnThis(),
    findOne: jest.fn().mockName(`${collectionName}.findOne`),
    findOneAndDelete: jest.fn().mockName(`${collectionName}.findOneAndDelete`),
    findOneAndUpdate: jest.fn().mockName(`${collectionName}.findOneAndUpdate`),
    fetch: jest.fn().mockName(`${collectionName}.fetch`),
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
  "ExampleIOUPaymentRefunds",
  "Groups",
  "MediaRecords",
  "NavigationItems",
  "NavigationTrees",
  "Notifications",
  "Orders",
  "Packages",
  "Products",
  "Revisions",
  "roles",
  "SellerShops",
  "Shipping",
  "Shops",
  "SimpleInventory",
  "Tags",
  "Templates",
  "Themes",
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
