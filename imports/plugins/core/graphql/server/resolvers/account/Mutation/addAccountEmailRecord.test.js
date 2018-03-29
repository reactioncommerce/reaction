import { encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import addAccountEmailRecord from "./addAccountEmailRecord";

test("correctly passes through to accounts/updateEmail method", () => {
  const accountId = encodeAccountOpaqueId("1");
  const email = "updatedEmail@reactioncommerce.com";
  const emailRecord = { provides: "default", address: "updatedEmail@reactioncommerce.com", verified: true };

  const fakeResult = { ...emailRecord };

  const mockMethod = jest.fn().mockName("accounts/updateEmailAddress method");
  mockMethod.mockReturnValueOnce(fakeResult);
  const context = {
    methods: {
      "accounts/updateEmailAddress": mockMethod
    }
  };

  const result = addAccountEmailRecord(null, {
    input: {
      accountId,
      email,
      clientMutationId: "clientMutationId"
    }
  }, context);

  expect(result).toEqual({
    emailRecord,
    clientMutationId: "clientMutationId"
  });
});
