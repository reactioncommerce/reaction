import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  accountId: String,
  addressId: String
});

/**
 * @name accounts/removeAccountAddressBookEntry
 * @memberof Mutations/Accounts
 * @summary Remove existing address in user's profile
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Necessary input for mutation. See SimpleSchema.
 * @param {String} input.accountId - optional decoded ID of account on which entry should be updated, for admin
 * @param {String} input.addressId - decoded ID of the address to remove
 * @returns {Promise<Object>} with removed address
 */
export default async function removeAccountAddressBookEntry(context, input) {
  inputSchema.validate(input);
  const { appEvents, collections, userHasPermission, userId: userIdFromContext } = context;
  const { Accounts } = collections;
  const {
    accountId,
    addressId
  } = input;

  const account = await Accounts.findOne({ _id: accountId });
  if (!account) throw new ReactionError("not-found", "Not Found");

  if (!context.isInternalCall && userIdFromContext !== accountId) {
    if (!userHasPermission(["reaction-accounts"], account.shopId)) throw new ReactionError("access-denied", "Access denied");
  }

  const addressBeingRemoved = account.profile && Array.isArray(account.profile.addressBook) &&
    account.profile.addressBook.find((addressBookItem) => addressId === addressBookItem._id);
  if (!addressBeingRemoved) throw new ReactionError("not-found", "Address Not Found");

  const { value: updatedAccount } = await Accounts.findOneAndUpdate({
    "_id": accountId,
    "profile.addressBook._id": addressId
  }, {
    $pull: {
      "profile.addressBook": {
        _id: addressId
      }
    }
  }, {
    returnOriginal: false
  });

  if (!updatedAccount) {
    throw new ReactionError("server-error", "Unable to remove address from account");
  }

  await appEvents.emit("afterAccountUpdate", {
    account: updatedAccount,
    updatedBy: userIdFromContext
  });

  // If the address remove was successful, then return the removed address
  return addressBeingRemoved;
}
