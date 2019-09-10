import { decodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import { decodeAddressOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/address";

/**
 * @name Mutation/removeAccountAddressBookEntry
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver for the removeAccountAddressBookEntry GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.accountId - The account ID
 * @param {String} args.input.addressId - The ID of the address to remove
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Object} removeAccountAddressBookEntryPayload
 */
export default async function removeAccountAddressBookEntry(_, { input }, context) {
  const { accountId, addressId, clientMutationId = null } = input;
  const decodedAccountId = decodeAccountOpaqueId(accountId);
  const decodedAddressId = decodeAddressOpaqueId(addressId);

  const removedAddress = await context.mutations.removeAccountAddressBookEntry(context, {
    addressId: decodedAddressId,
    accountId: decodedAccountId
  });

  return {
    address: removedAddress,
    clientMutationId
  };
}
