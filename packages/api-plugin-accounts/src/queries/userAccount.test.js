import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import ReactionError from "@reactioncommerce/reaction-error";
import userAccountQuery from "./userAccount.js";

const fakeAccountId = "FAKE_USER_ID_FOR_QUERY";
const fakeAccount = { _id: fakeAccountId, userId: fakeAccountId, shopId: "ACCOUNT_SHOP_ID" };
const fakeContextAccount = { _id: mockContext.accountId, userId: mockContext.userId, shopId: "ACCOUNT_SHOP_ID" };

beforeEach(() => {
  jest.resetAllMocks();
});

test("throws if account not found", async () => {
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(undefined);
  await expect(userAccountQuery(mockContext, fakeAccountId)).rejects.toThrowErrorMatchingSnapshot();
  expect(mockContext.collections.Accounts.findOne).toHaveBeenCalledWith({ _id: fakeAccountId });
});

test("throws if userHasPermission returns false and the user ID is not the context user ID", async () => {
  mockContext.validatePermissions.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });

  mockContext.collections.Accounts.findOne.mockReturnValueOnce(fakeAccount);
  await expect(userAccountQuery(mockContext, fakeAccountId)).rejects.toThrowErrorMatchingSnapshot();
  expect(mockContext.validatePermissions).toHaveBeenCalledWith(
    "reaction:legacy:accounts",
    "read",
    { owner: fakeAccountId }
  );
});

test("returns the account without calling userHasPermission if the user ID is the context user ID", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(false);
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(fakeContextAccount);
  const result = await userAccountQuery(mockContext, mockContext.accountId);
  expect(mockContext.userHasPermission).not.toHaveBeenCalled();
  expect(result).toEqual(fakeContextAccount);
});

test("returns the account if the user ID is not the context user ID but userHasPermission returns true", async () => {
  mockContext.validatePermissions.mockReturnValueOnce(Promise.resolve(null));
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(fakeAccount);
  const result = await userAccountQuery(mockContext, fakeAccountId);
  expect(mockContext.validatePermissions).toHaveBeenCalledWith(
    "reaction:legacy:accounts",
    "read",
    { owner: fakeAccountId }
  );
  expect(result).toEqual(fakeAccount);
});
