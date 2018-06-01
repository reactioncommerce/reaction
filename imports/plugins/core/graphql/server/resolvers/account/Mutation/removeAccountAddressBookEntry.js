import { decodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import { decodeAddressOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/address";

/**
 * @name "Mutation.removeAccountAddressBookEntry"
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver for the removeAccountAddressBookEntry GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.accoundId - The account ID
 * @param {String} args.input.addressId - The ID of the address to remove
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @return {Object} removeAccountAddressBookEntryPayload
 */
export default function removeAccountAddressBookEntry(_, { input }, context) {
  const { accountId, addressId, clientMutationId = null } = input;
  const dbAccountId = decodeAccountOpaqueId(accountId);
  const dbAddressId = decodeAddressOpaqueId(addressId);
  const removedAddress = context.methods["accounts/addressBookRemove"](context, [dbAddressId, dbAccountId]);
  return {
    address: removedAddress,
    clientMutationId
  };
}
