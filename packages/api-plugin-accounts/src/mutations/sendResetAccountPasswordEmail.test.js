import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import sendResetAccountPasswordEmail from "./sendResetAccountPasswordEmail.js";

mockContext.mutations.sendResetAccountPasswordEmail = jest.fn().mockName("mutations.sendResetAccountPasswordEmail");

test("throws if account matching email not found", async () => {
  mockContext.collections.Accounts.findOne.mockReturnValueOnce(undefined);
  await expect(sendResetAccountPasswordEmail(mockContext, { email: "test@email.com", url: "https://example.com" })).rejects.toThrowErrorMatchingSnapshot();
});
