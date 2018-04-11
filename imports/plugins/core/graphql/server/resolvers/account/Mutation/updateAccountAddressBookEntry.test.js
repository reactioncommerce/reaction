import { encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import updateAccountAddressBookEntry from "./updateAccountAddressBookEntry";

test("correctly passes through to accounts/addressBookUpdate method", () => {
  const accountId = encodeAccountOpaqueId("1");
  const address = { address1: "456 Pico Blvd" };

  const fakeResult = { _id: "1", ...address };

  const mockMethod = jest.fn().mockName("accounts/addressBookUpdate method");
  mockMethod.mockReturnValueOnce(fakeResult);
  const context = {
    methods: {
      "accounts/addressBookUpdate": mockMethod
    }
  };

  const result = updateAccountAddressBookEntry(null, {
    input: {
      accountId,
      address,
      clientMutationId: "clientMutationId"
    }
  }, context);

  expect(result).toEqual({
    address: fakeResult,
    clientMutationId: "clientMutationId"
  });
});
