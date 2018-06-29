import { encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import addAccountAddressBookEntry from "./addAccountAddressBookEntry";

test("correctly passes through to mutations.accounts.addressBookAdd", async () => {
  const accountId = encodeAccountOpaqueId("1");
  const address = { address1: "123 Main St" };

  const fakeResult = { _id: "1", ...address };

  const mockMutation = jest.fn().mockName("mutations.accounts.addressBookAdd");
  mockMutation.mockReturnValueOnce(Promise.resolve(fakeResult));
  const context = {
    mutations: {
      accounts: {
        addressBookAdd: mockMutation
      }
    }
  };

  const result = await addAccountAddressBookEntry(null, {
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
