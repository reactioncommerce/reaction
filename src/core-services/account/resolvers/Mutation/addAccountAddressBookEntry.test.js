import { encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import addAccountAddressBookEntry from "./addAccountAddressBookEntry.js";

test("correctly passes through to mutations.addressBookAdd", async () => {
  const accountId = encodeAccountOpaqueId("1");
  const address = { address1: "123 Main St" };

  const fakeResult = { _id: "1", ...address };

  const mockMutation = jest.fn().mockName("mutations.addressBookAdd");
  mockMutation.mockReturnValueOnce(Promise.resolve(fakeResult));
  const context = {
    mutations: {
      addressBookAdd: mockMutation
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
