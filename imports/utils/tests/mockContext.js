import mockCollection from "./mockCollection.js";

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
