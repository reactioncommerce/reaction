import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import setAccountProfileCurrency from "./setAccountProfileCurrency.js";

test("throws if account not found - auth account", async () => {
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(undefined);

  await expect(setAccountProfileCurrency({
    ...mockContext,
    accountId: "CONTEXT_ACCOUNT"
  }, { currencyCode: "USD" })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.collections.Accounts.findOne).toHaveBeenCalledWith({ _id: "CONTEXT_ACCOUNT" }, { projection: { shopId: 1 } });
});

test("throws if account not found - other account", async () => {
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(undefined);

  await expect(setAccountProfileCurrency(mockContext, {
    accountId: "OTHER_ACCOUNT",
    currencyCode: "USD"
  })).rejects.toThrowErrorMatchingSnapshot();

  expect(mockContext.collections.Accounts.findOne).toHaveBeenCalledWith({ _id: "OTHER_ACCOUNT" }, { projection: { shopId: 1 } });
});

test("throws if currency code is invalid", async () => {
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(Promise.resolve({ shopId: "SHOP_ID" }));

  await expect(setAccountProfileCurrency(mockContext, {
    accountId: "OTHER_ACCOUNT",
    currencyCode: "BAD_CODE"
  })).rejects.toThrowErrorMatchingSnapshot();
});

test("succeeds with valid currency code and account", async () => {
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(Promise.resolve({ shopId: "SHOP_ID" }));
  mockContext.collections.Accounts.findOneAndUpdate.mockReturnValueOnce(Promise.resolve({ value: "MOCK_UPDATED_ACCOUNT" }));

  const updatedAccount = await setAccountProfileCurrency(mockContext, {
    accountId: "OTHER_ACCOUNT",
    currencyCode: "EUR"
  });

  expect(updatedAccount).toBe("MOCK_UPDATED_ACCOUNT");
  expect(mockContext.collections.Accounts.findOneAndUpdate).toHaveBeenCalled();
});
