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

test("throws if userHasPermissionLegacy returns false and the user ID is not the context user ID", async () => {
  mockContext.validatePermissionsLegacy.mockImplementation(() => {
    throw new ReactionError("access-denied", "Access Denied");
  });

  mockContext.collections.Accounts.findOne.mockReturnValueOnce(fakeAccount);
  await expect(userAccountQuery(mockContext, fakeAccountId)).rejects.toThrowErrorMatchingSnapshot();
  expect(mockContext.validatePermissionsLegacy).toHaveBeenCalledWith(["reaction-accounts"], fakeAccount.shopId);
});

test("returns the account without calling userHasPermissionLegacy if the user ID is the context user ID", async () => {
  mockContext.userHasPermissionLegacy.mockReturnValueOnce(false);
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(fakeContextAccount);
  const result = await userAccountQuery(mockContext, mockContext.accountId);
  expect(mockContext.userHasPermissionLegacy).not.toHaveBeenCalled();
  expect(result).toEqual(fakeContextAccount);
});

test("returns the account if the user ID is not the context user ID but userHasPermissionLegacy returns true", async () => {
  mockContext.validatePermissionsLegacy.mockReturnValueOnce(Promise.resolve(null));
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(fakeAccount);
  const result = await userAccountQuery(mockContext, fakeAccountId);
  expect(mockContext.validatePermissionsLegacy).toHaveBeenCalledWith(["reaction-accounts"], fakeAccount.shopId);
  expect(result).toEqual(fakeAccount);
});
