import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import buildContext from "./buildContext";

const fakeUser = { _id: "FAKE_BUILD_CONTEXT_USER_ID" };
const mockAccount = { _id: "accountId", userId: fakeUser._id };
const accountByUserId = jest.fn().mockName("accountByUserId").mockReturnValue(Promise.resolve(mockAccount));

const auth = {
  accountByUserId,
  getHasPermissionFunctionForUser: () => () => {},
  getShopsUserHasPermissionForFunctionForUser: () => () => {}
};

test("properly mutates the context object without user", async () => {
  process.env.ROOT_URL = "http://localhost:3000";
  const context = {
    auth,
    checkPermissions: mockContext.checkPermissions,
    collections: mockContext.collections,
    queries: {
      primaryShopId: () => "PRIMARY_SHOP_ID"
    }
  };

  await buildContext(context, { user: undefined });
  expect(context).toEqual({
    account: null,
    accountId: null,
    auth,
    checkPermissions: jasmine.any(Function),
    collections: mockContext.collections,
    isInternalCall: false,
    queries: {
      primaryShopId: jasmine.any(Function)
    },
    requestHeaders: {},
    shopsUserHasPermissionFor: jasmine.any(Function),
    user: null,
    userHasPermission: jasmine.any(Function),
    userId: null
  });
});

test("properly mutates the context object with user", async () => {
  process.env.ROOT_URL = "https://localhost:3000";
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(Promise.resolve(mockAccount));

  const context = {
    auth,
    checkPermissions: mockContext.checkPermissions,
    collections: mockContext.collections,
    queries: {
      primaryShopId: () => "PRIMARY_SHOP_ID"
    }
  };
  await buildContext(context, { user: fakeUser });
  expect(context).toEqual({
    account: mockAccount,
    accountId: mockAccount._id,
    auth,
    checkPermissions: jasmine.any(Function),
    collections: mockContext.collections,
    isInternalCall: false,
    queries: {
      primaryShopId: jasmine.any(Function)
    },
    requestHeaders: {},
    shopsUserHasPermissionFor: jasmine.any(Function),
    user: fakeUser,
    userHasPermission: jasmine.any(Function),
    userId: fakeUser._id
  });
});
