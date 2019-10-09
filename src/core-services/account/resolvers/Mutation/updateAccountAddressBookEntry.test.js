import { encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import { encodeAddressOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/address";
import mockContext from "@reactioncommerce/api-utils/tests/mockContext.js";
import updateAccountAddressBookEntry from "./updateAccountAddressBookEntry.js";

mockContext.mutations.updateAccountAddressBookEntry = jest.fn().mockName("mutations.updateAccountAddressBookEntry");

test("correctly passes through to internal mutation function", async () => {
  const accountId = encodeAccountOpaqueId("1");
  const addressId = encodeAddressOpaqueId("2");
  const address = { address1: "456 Pico Blvd" };

  const fakeResult = { _id: "2", ...address };

  mockContext.mutations.updateAccountAddressBookEntry.mockReturnValueOnce(Promise.resolve(fakeResult));

  const result = await updateAccountAddressBookEntry(null, {
    input: {
      accountId,
      addressId,
      updates: address,
      clientMutationId: "clientMutationId",
      type: "billing"
    }
  }, mockContext);

  expect(mockContext.mutations.updateAccountAddressBookEntry).toHaveBeenCalledWith(
    mockContext,
    { address: fakeResult, accountId: "1", type: "billing" }
  );

  expect(result).toEqual({
    address: fakeResult,
    clientMutationId: "clientMutationId"
  });
});
