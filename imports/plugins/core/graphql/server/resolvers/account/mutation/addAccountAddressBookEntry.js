import { decodeAccountOpaqueId, encodeAccountOpaqueId } from "@reactioncommerce/reaction-graphql-xforms/account";

/**
 * @name addAccountAddressBookEntry
 * @method
 * @summary resolver for the addAccountAddressBookEntry GraphQL mutation
 * @param {Object} _ - unused
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} args.accountId - opaque ID of account to which entry should be added
 * @param {Object} args.address - address object, in GraphQL schema format
 * @param {Object} context - an object containing the per-request state
 * @return {Object} Address object, in GraphQL schema format
 */
export default function addAccountAddressBookEntry(_, { accountId, address }, context) {
  const dbAccountId = decodeAccountOpaqueId(accountId);
  const result = context.methods["accounts/addressBookAdd"](context, [address, dbAccountId]);
  result._id = encodeAccountOpaqueId(result._id);
  return result;
}
