import { decodeAccountOpaqueId, encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";

/**
 * @name addAccountAddressBookEntry
 * @method
 * @summary resolver for the addAccountAddressBookEntry GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {Object} context - an object containing the per-request state
 * @return {Object} AddAccountAddressBookEntryPayload
 */
export default function addAccountAddressBookEntry(_, { input }, context) {
  const { accountId, address, clientMutationId = null } = input;
  const dbAccountId = decodeAccountOpaqueId(accountId);
  const updatedAddress = context.methods["accounts/addressBookAdd"](context, [address, dbAccountId]);
  return {
    address: {
      ...updatedAddress,
      _id: encodeAccountOpaqueId(updatedAddress._id)
    },
    clientMutationId
  };
}
