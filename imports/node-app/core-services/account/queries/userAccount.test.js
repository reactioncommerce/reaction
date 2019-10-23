import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import userAccountQuery from "./userAccount.js";

const fakeAccountId = "FAKE_USER_ID_FOR_QUERY";
const fakeAccount = { _id: fakeAccountId, shopId: "ACCOUNT_SHOP_ID" };

beforeEach(() => {
  jest.resetAllMocks();
});

test("throws if account not found", async () => {
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(undefined);
  await expect(userAccountQuery(mockContext, fakeAccountId)).rejects.toThrowErrorMatchingSnapshot();
  expect(mockContext.collections.Accounts.findOne).toHaveBeenCalledWith({ _id: fakeAccountId });
});

test("throws if userHasPermission returns false and the user ID is not the context user ID", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(false);
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(fakeAccount);
  await expect(userAccountQuery(mockContext, fakeAccountId)).rejects.toThrowErrorMatchingSnapshot();
  expect(mockContext.userHasPermission).toHaveBeenCalledWith(["reaction-accounts"], fakeAccount.shopId);
});

test("returns the account without calling userHasPermission if the user ID is the context user ID", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(false);
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(fakeAccount);
  const result = await userAccountQuery(mockContext, mockContext.userId);
  expect(mockContext.userHasPermission).not.toHaveBeenCalled();
  expect(result).toEqual(fakeAccount);
});

test("returns the account if the user ID is not the context user ID but userHasPermission returns true", async () => {
  mockContext.userHasPermission.mockReturnValueOnce(true);
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(fakeAccount);
  const result = await userAccountQuery(mockContext, fakeAccountId);
  expect(mockContext.userHasPermission).toHaveBeenCalledWith(["reaction-accounts"], fakeAccount.shopId);
  expect(result).toEqual(fakeAccount);
});
