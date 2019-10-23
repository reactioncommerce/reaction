import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import sendResetAccountPasswordEmail from "./sendResetAccountPasswordEmail.js";

mockContext.mutations.sendResetAccountPasswordEmail = jest.fn().mockName("mutations.sendResetAccountPasswordEmail");

test("throws if account matching email not found", async () => {
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(undefined);
  await expect(sendResetAccountPasswordEmail(mockContext, { email: "test@email.com" })).rejects.toThrowErrorMatchingSnapshot();
});

test("throws if account matching email is found, but user is not found", async () => {
  mockContext.collections.Accounts.findOne.mockReturnValueOnce({ _id: "123", emails: [{ address: "test@email.com" }] });
  mockContext.collections.users.findOne.mockReturnValueOnce(undefined);
  await expect(sendResetAccountPasswordEmail(mockContext, { email: "test@email.com" })).rejects.toThrowErrorMatchingSnapshot();
});
