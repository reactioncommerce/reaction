import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import sendResetAccountPasswordEmail from "./sendResetAccountPasswordEmail.js";

mockContext.mutations.sendResetAccountPasswordEmail = jest.fn().mockName("mutations.sendResetAccountPasswordEmail");

test("throws if account matching email not found", async () => {
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(undefined);
  await expect(sendResetAccountPasswordEmail(mockContext, { email: "test@email.com" })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if account matching email is found, but shop is not found", async () => {
  mockContext.collections.Accounts.findOne.mockReturnValueOnce({ _id: "123", emails: [{ address: "test@email.com" }], userId: "654" });
  mockContext.mutations.startIdentityPasswordReset = jest.fn().mockName("startIdentityPasswordReset").mockReturnValueOnce({ token: "TOKEN" });
  await expect(sendResetAccountPasswordEmail(mockContext, { email: "test@email.com" })).rejects.toThrowErrorMatchingSnapshot();
  expect(mockContext.mutations.startIdentityPasswordReset).toHaveBeenCalledWith(mockContext, {
    email: "test@email.com",
    userId: "654"
  });
});
