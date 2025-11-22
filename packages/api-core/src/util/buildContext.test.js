import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import buildContext from "./buildContext";

const fakeUser = { _id: "FAKE_BUILD_CONTEXT_USER_ID" };
const mockAccount = { _id: "accountId", userId: fakeUser._id };
const accountByUserId = jest.fn().mockName("accountByUserId").mockReturnValue(Promise.resolve(mockAccount));

const auth = {
  accountByUserId
};

test("properly mutates the context object without user", async () => {
  process.env.ROOT_URL = "http://localhost:3000";
  const context = {
    auth,
    collections: mockContext.collections,
    getFunctionsOfType: mockContext.getFunctionsOfType,
    queries: {
      primaryShopId: () => "PRIMARY_SHOP_ID"
    },
    userPermissions: [],
    validatePermissions: mockContext.validatePermissions
  };

  await buildContext(context, { user: undefined });
  expect(context).toEqual({
    account: null,
    accountId: null,
    auth,
    collections: mockContext.collections,
    getFunctionsOfType: mockContext.getFunctionsOfType,
    queries: {
      primaryShopId: jasmine.any(Function)
    },
    requestHeaders: {},
    user: null,
    userHasPermission: jasmine.any(Function),
    userPermissions: [],
    validatePermissions: jasmine.any(Function),
    userId: null
  });
});

test("properly mutates the context object with user", async () => {
  process.env.ROOT_URL = "https://localhost:3000";
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(Promise.resolve(mockAccount));

  const context = {
    auth,
    collections: mockContext.collections,
    getFunctionsOfType: mockContext.getFunctionsOfType,
    queries: {
      primaryShopId: () => "PRIMARY_SHOP_ID"
    },
    userPermissions: [],
    validatePermissions: mockContext.validatePermissions
  };
  await buildContext(context, { user: fakeUser });
  expect(context).toEqual({
    account: mockAccount,
    accountId: mockAccount._id,
    auth,
    collections: mockContext.collections,
    getFunctionsOfType: mockContext.getFunctionsOfType,
    queries: {
      primaryShopId: jasmine.any(Function)
    },
    requestHeaders: {},
    user: fakeUser,
    userHasPermission: jasmine.any(Function),
    userPermissions: [],
    validatePermissions: jasmine.any(Function),
    userId: fakeUser._id
  });
});

test("coalesces concurrent account creation for the same user into a single createAccount call", async () => {
  const userId = "CONCURRENT_USER_ID";
  const concurrentUser = { _id: userId, emails: [{ address: "test@example.com" }], name: "Concurrent User", profile: {} };

  let createdAccount = null;

  const concurrentAccountByUserId = jest.fn().mockName("concurrentAccountByUserId").mockImplementation(async () => createdAccount);

  const createAccount = jest.fn().mockName("createAccount").mockImplementation(async () => {
    // Simulate async work and DB round trip
    await new Promise((resolve) => setTimeout(resolve, 10));
    createdAccount = { _id: "CONCURRENT_ACCOUNT_ID", userId };
    return createdAccount;
  });

  const concurrentAuth = {
    accountByUserId: concurrentAccountByUserId,
    permissionsByUserId: jest.fn().mockResolvedValue([])
  };

  const makeContext = () => {
    const ctx = {
      auth: concurrentAuth,
      collections: mockContext.collections,
      getFunctionsOfType: mockContext.getFunctionsOfType,
      mutations: {
        createAccount
      },
      queries: {
        primaryShopId: () => "PRIMARY_SHOP_ID"
      },
      userPermissions: [],
      validatePermissions: mockContext.validatePermissions
    };

    // Minimal stub to satisfy buildContext's use of context.getInternalContext()
    ctx.getInternalContext = function getInternalContext() {
      return {
        ...this,
        isInternalCall: true
      };
    };

    return ctx;
  };

  const contexts = [makeContext(), makeContext(), makeContext(), makeContext(), makeContext()];

  await Promise.all(contexts.map((ctx) => buildContext(ctx, { user: concurrentUser })));

  expect(createAccount).toHaveBeenCalledTimes(1);
  contexts.forEach((ctx) => {
    expect(ctx.account).toEqual(createdAccount);
    expect(ctx.accountId).toEqual(createdAccount._id);
    expect(ctx.userId).toEqual(userId);
  });
});
