import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import { encodeAccountOpaqueId } from "../../xforms/id.js";
import setAccountDefaultEmail from "./setAccountDefaultEmail.js";

mockContext.mutations.setAccountDefaultEmail = jest.fn().mockName("mutations.setAccountDefaultEmail");

test("correctly passes through to internal mutation function", async () => {
  const accountId = encodeAccountOpaqueId("2");
  const email = "test-account@email.com";
  const updatedAccount = { _id: "2", emails: [] };

  mockContext.mutations.setAccountDefaultEmail.mockReturnValueOnce(Promise.resolve(updatedAccount));

  const result = await setAccountDefaultEmail(null, {
    input: {
      accountId,
      email,
      clientMutationId: "clientMutationId"
    }
  }, mockContext);

  expect(mockContext.mutations.setAccountDefaultEmail).toHaveBeenCalledWith(
    mockContext,
    { accountId: "2", email }
  );

  expect(result).toEqual({
    account: updatedAccount,
    clientMutationId: "clientMutationId"
  });
});
