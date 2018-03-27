import { decodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import { xformAddressResponse } from "@reactioncommerce/reaction-graphql-xforms/address";

/**
 * @name addAccountAddressBookEntry
 * @method
 * @summary resolver for the addAccountAddressBookEntry GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} [args.input.accoundId] - The account ID, which defaults to the viewer account
 * @param {AddressInput} args.input.address - The address to add
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @return {Object} AddAccountAddressBookEntryPayload
 */
export default function addAccountAddressBookEntry(_, { input }, context) {
  const { accountId, address, clientMutationId = null } = input;
  const dbAccountId = accountId && decodeAccountOpaqueId(accountId);
  const updatedAddress = context.methods["accounts/addressBookAdd"](context, [address, dbAccountId]);
  return {
    address: xformAddressResponse(updatedAddress),
    clientMutationId
  };
}
