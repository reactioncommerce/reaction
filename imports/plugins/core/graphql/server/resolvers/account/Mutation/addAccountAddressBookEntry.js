import { decodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";

/**
 * @name "Mutation.addAccountAddressBookEntry"
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver for the addAccountAddressBookEntry GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.accoundId - The account ID
 * @param {AddressInput} args.input.address - The address to add
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @return {Object} AddAccountAddressBookEntryPayload
 */
export default function addAccountAddressBookEntry(_, { input }, context) {
  const { accountId, address, clientMutationId = null } = input;
  const dbAccountId = decodeAccountOpaqueId(accountId);
  const updatedAddress = context.methods["accounts/addressBookAdd"](context, [address, dbAccountId]);
  return {
    address: updatedAddress,
    clientMutationId
  };
}
