import { encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import { encodeAddressOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/address";
import updateAccountAddressBookEntry from "./updateAccountAddressBookEntry";

test("correctly passes through to accounts/addressBookUpdate method", () => {
  const accountId = encodeAccountOpaqueId("1");
  const addressId = encodeAddressOpaqueId("2");
  const address = { address1: "456 Pico Blvd" };

  const fakeResult = { _id: "2", ...address };

  const mockMethod = jest.fn().mockName("accounts/addressBookUpdate method");
  mockMethod.mockReturnValueOnce(fakeResult);
  const context = {
    callMeteorMethod: mockMethod
  };

  const result = updateAccountAddressBookEntry(null, {
    input: {
      accountId,
      addressId,
      updates: address,
      clientMutationId: "clientMutationId",
      type: "billing"
    }
  }, context);

  expect(mockMethod).toHaveBeenCalledWith("accounts/addressBookUpdate", fakeResult, "1", "billing");

  expect(result).toEqual({
    address: fakeResult,
    clientMutationId: "clientMutationId"
  });
});
