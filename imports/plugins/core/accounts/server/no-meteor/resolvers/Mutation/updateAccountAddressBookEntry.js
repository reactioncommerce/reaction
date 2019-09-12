import { decodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";
import { xformAddressInput } from "@reactioncommerce/reaction-graphql-xforms/address";

/**
 * @name Mutation/updateAccountAddressBookEntry
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver for the updateAccountAddressBookEntry GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.accountId - optional opaque ID of account on which entry should be updated, for admins
 * @param {String} args.input.addressId - opaque ID of the address to edit
 * @param {Object} args.input.updates - updated address object, in GraphQL schema format
 * @param {String} args.input.type - If present, make this address the default address of this type (billing or shipping)
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Object} UpdateAccountAddressBookEntryPayload
 */
export default async function updateAccountAddressBookEntry(_, { input }, context) {
  const { accountId, addressId, clientMutationId, type, updates } = input;
  const decodedAccountId = decodeAccountOpaqueId(accountId);
  const address = xformAddressInput({ ...updates, _id: addressId });

  const updatedAddress = await context.mutations.updateAccountAddressBookEntry(context, {
    address,
    accountId: decodedAccountId,
    type
  });

  return {
    address: updatedAddress,
    clientMutationId
  };
}
