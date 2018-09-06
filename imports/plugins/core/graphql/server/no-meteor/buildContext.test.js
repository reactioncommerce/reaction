import mockContext from "/imports/test-utils/helpers/mockContext";
import mutations from "./mutations";
import queries from "./queries";
import buildContext from "./buildContext";

const fakeUser = {
  _id: "FAKE_BUILD_CONTEXT_USER_ID"
};

test("properly mutates the context object without user", async () => {
  process.env.ROOT_URL = "http://localhost:3000";
  const context = { collections: mockContext.collections };
  await buildContext(context, { user: undefined });
  expect(context).toEqual({
    collections: mockContext.collections,
    mutations,
    queries,
    shopId: null,
    user: null,
    userHasPermission: jasmine.any(Function),
    userId: null,
    rootUrl: "http://localhost:3000/",
    getAbsoluteUrl: jasmine.any(Function)
  });
});

test("properly mutates the context object with user", async () => {
  process.env.ROOT_URL = "https://localhost:3000";
  const mockAccount = { _id: "accountId", userId: fakeUser._id };
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(Promise.resolve(mockAccount));

  const context = { collections: mockContext.collections };
  await buildContext(context, { user: fakeUser });
  expect(context).toEqual({
    account: mockAccount,
    accountId: mockAccount._id,
    collections: mockContext.collections,
    mutations,
    queries,
    shopId: null,
    user: fakeUser,
    userHasPermission: jasmine.any(Function),
    userId: fakeUser._id,
    rootUrl: "https://localhost:3000/",
    getAbsoluteUrl: jasmine.any(Function)
  });

  // Make sure the hasPermission currying works with one arg
  const result1 = await context.userHasPermission(["foo"]);
  expect(result1).toBe(false);

  // Make sure the hasPermission currying works with two args
  const result2 = await context.userHasPermission(["foo"], "scope");
  expect(result2).toBe(false);
});
