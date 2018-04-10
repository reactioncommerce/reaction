import { encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import { encodeAddressOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/address";
import removeAccountAddressBookEntry from "./removeAccountAddressBookEntry";

test("correctly passes through to accounts/addressBookRemove method", () => {
  const accountId = encodeAccountOpaqueId("1");
  const addressId = encodeAddressOpaqueId("1");
  const address = { address1: "123 Main St" };

  const fakeResult = { _id: "1", ...address };

  const mockMethod = jest.fn().mockName("accounts/addressBookRemove method");
  mockMethod.mockReturnValueOnce(fakeResult);
  const context = {
    methods: {
      "accounts/addressBookRemove": mockMethod
    }
  };

  const result = removeAccountAddressBookEntry(null, {
    input: {
      accountId,
      addressId,
      clientMutationId: "clientMutationId"
    }
  }, context);

  expect(result).toEqual({
    address: fakeResult,
    clientMutationId: "clientMutationId"
  });
});
