import { encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import setAccountProfileCurrency from "./setAccountProfileCurrency.js";

mockContext.mutations.setAccountProfileCurrency = jest.fn().mockName("mutations.setAccountProfileCurrency");

test("correctly passes through to internal mutation function", async () => {
  const accountId = encodeAccountOpaqueId("1");
  const currencyCode = "USD";

  const fakeResult = { _id: "1", profile: { currencyCode: "USD" } };

  mockContext.mutations.setAccountProfileCurrency.mockReturnValueOnce(Promise.resolve(fakeResult));

  const result = await setAccountProfileCurrency(null, {
    input: {
      accountId,
      currencyCode,
      clientMutationId: "clientMutationId"
    }
  }, mockContext);

  expect(mockContext.mutations.setAccountProfileCurrency).toHaveBeenCalledWith(
    mockContext,
    { accountId: "1", currencyCode: "USD" }
  );

  expect(result).toEqual({
    account: fakeResult,
    clientMutationId: "clientMutationId"
  });
});
