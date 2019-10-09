import { encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import removeAccountEmailRecord from "./removeAccountEmailRecord.js";

mockContext.mutations.removeAccountEmailRecord = jest.fn().mockName("mutations.removeAccountEmailRecord");

test("correctly passes through to internal mutation function", async () => {
  const accountId = encodeAccountOpaqueId("2");
  const email = "test-account@email.com";
  const updatedAccount = { _id: "2", emails: [] };

  mockContext.mutations.removeAccountEmailRecord.mockReturnValueOnce(Promise.resolve(updatedAccount));

  const result = await removeAccountEmailRecord(null, {
    input: {
      accountId,
      email,
      clientMutationId: "clientMutationId"
    }
  }, mockContext);

  expect(mockContext.mutations.removeAccountEmailRecord).toHaveBeenCalledWith(
    mockContext,
    { accountId: "2", email }
  );

  expect(result).toEqual({
    account: updatedAccount,
    clientMutationId: "clientMutationId"
  });
});
