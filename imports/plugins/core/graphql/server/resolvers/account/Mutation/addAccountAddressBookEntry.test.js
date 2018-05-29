import { encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import addAccountAddressBookEntry from "./addAccountAddressBookEntry";

test("correctly passes through to accounts/addressBookAdd method", () => {
  const accountId = encodeAccountOpaqueId("1");
  const address = { address1: "123 Main St" };

  const fakeResult = { _id: "1", ...address };

  const mockMethod = jest.fn().mockName("accounts/addressBookAdd method");
  mockMethod.mockReturnValueOnce(fakeResult);
  const context = {
    methods: {
      "accounts/addressBookAdd": mockMethod
    }
  };

  const result = addAccountAddressBookEntry(null, {
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
