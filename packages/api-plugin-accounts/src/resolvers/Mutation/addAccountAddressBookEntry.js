import isOpaqueId from "@reactioncommerce/api-utils/isOpaqueId.js";
import { decodeAccountOpaqueId } from "../../xforms/id.js";

/**
 * @name Mutation/addAccountAddressBookEntry
 * @method
 * @memberof Accounts/GraphQL
 * @summary resolver for the addAccountAddressBookEntry GraphQL mutation
 * @param {Object} parentResult - unused
 * @param {Object} args.input - an object of all mutation arguments that were sent by the client
 * @param {String} args.input.accountId - The account ID
 * @param {AddressInput} args.input.address - The address to add
 * @param {String} [args.input.clientMutationId] - An optional string identifying the mutation call
 * @param {Object} context - an object containing the per-request state
 * @returns {Promise<Object>} AddAccountAddressBookEntryPayload
 */
export default async function addAccountAddressBookEntry(parentResult, { input }, context) {
  const { accountId, address, clientMutationId = null } = input;
  const dbAccountId = isOpaqueId(accountId) ? decodeAccountOpaqueId(accountId) : accountId;
  const updatedAddress = await context.mutations.addressBookAdd(context, address, dbAccountId);
  return {
    address: updatedAddress,
    clientMutationId
  };
}
