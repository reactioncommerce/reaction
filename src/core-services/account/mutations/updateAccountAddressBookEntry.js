import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import { AccountProfileAddress } from "../simpleSchemas.js";

const inputSchema = new SimpleSchema({
  address: AccountProfileAddress,
  accountId: String,
  type: {
    type: String,
    optional: true
  }
});

/**
 * @name accounts/updateAccountAddressBookEntry
 * @memberof Mutations/Accounts
 * @summary Update an existing address on an account
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Necessary input for mutation. See SimpleSchema.
 * @param {Object} input.address - address to update
 * @param {String} input.accountId - optional decoded ID of account on which entry should be updated, for admins
 * @param {String} [input.type] - If present, make this address the default address of this type (billing or shipping)
 * @returns {Promise<Object>} with updated address
 */
export default async function updateAccountAddressBookEntry(context, input) {
  inputSchema.validate(input);
  const { appEvents, collections, userHasPermission, userId: userIdFromContext } = context;
  const { Accounts } = collections;
  const { address, accountId, type } = input;

  const account = await Accounts.findOne({ _id: accountId });

  if (!account) throw new ReactionError("not-found", "No account found");

  if (!context.isInternalCall && userIdFromContext !== accountId) {
    if (!userHasPermission(["reaction-accounts"], account.shopId)) throw new ReactionError("access-denied", "Access denied");
  }

  // Make sure address exists before trying to update
  const oldAddress = (account.profile.addressBook || []).find((addr) => addr._id === address._id);
  if (!oldAddress) throw new ReactionError("not-found", `No existing address found with ID ${address._id}`);

  // If type is provided, set updated address to be default for `type`
  if (type) {
    Object.assign(address, { [type]: true });
  }

  // Update all other to set the default type to false
  account.profile.addressBook.forEach((addr) => {
    if (addr._id === address._id) {
      Object.assign(addr, address);
    } else if (type) {
      Object.assign(addr, { [type]: false });
    }
  });

  const accountsUpdateQuery = {
    $set: {
      "profile.addressBook": account.profile.addressBook
    }
  };

  // Update the name when there is no name or the user updated his only shipping address
  if (!account.name || (account.profile && account.profile.addressbook && account.profile.addressbook.length <= 1)) {
    accountsUpdateQuery.$set.name = address.fullName;
  }

  // Update the Reaction Accounts collection with new address info
  const { value: updatedAccount } = await Accounts.findOneAndUpdate(
    {
      _id: accountId
    },
    accountsUpdateQuery,
    {
      returnOriginal: false
    }
  );

  if (!updatedAccount) {
    throw new ReactionError("server-error", "Unable to update account address");
  }

  // Create an array which contains all fields that have changed
  // This is used for search, to determine if we need to re-index
  const updatedFields = [];
  Object.keys(address).forEach((key) => {
    if (address[key] !== oldAddress[key]) {
      updatedFields.push(key);
    }
  });

  await appEvents.emit("afterAccountUpdate", {
    account: updatedAccount,
    updatedBy: userIdFromContext,
    updatedFields
  });

  // // If the address update was successful, then return the full updated address.
  // // Since we just pushed into `profile.addressBook`, we know it will exist.
  return updatedAccount.profile.addressBook.find((updatedAddress) => address._id === updatedAddress._id);
}
