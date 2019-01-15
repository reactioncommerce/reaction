import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Accounts } from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";
import appEvents from "/imports/node-app/core/util/appEvents";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name accounts/addressBookUpdate
 * @memberof Accounts/Methods
 * @method
 * @summary Update existing address in user's profile
 * @param {Object} address - address
 * @param {String|null} [accountUserId] - `account.userId` used by admin to edit users
 * @param {shipping|billing} [type] - name of selected address type
 * @return {Object} The updated address
 */
export default function addressBookUpdate(address, accountUserId, type) {
  Schemas.Address.validate(address);
  check(accountUserId, Match.Maybe(String));
  check(type, Match.Maybe(String));
  this.unblock();

  const authUserId = Reaction.getUserId();
  const userId = accountUserId || Reaction.getUserId();
  const account = Accounts.findOne({ userId });
  if (authUserId !== userId && !Reaction.hasPermission("reaction-accounts", authUserId, account.shopId)) {
    throw new ReactionError("access-denied", "Access denied");
  }

  // Find old state of isShippingDefault & isBillingDefault to compare and reflect in cart
  const oldAddress = (account.profile.addressBook || []).find((addr) => addr._id === address._id);

  if (!oldAddress) throw new ReactionError("not-found", `No existing address found with ID ${address._id}`);

  // Set new address to be default for `type`
  if (typeof type === "string") {
    Object.assign(address, { [type]: true });
  }

  // Update all other to set the default type to false
  account.profile.addressBook.forEach((addr) => {
    if (addr._id === address._id) {
      Object.assign(addr, address);
    } else if (typeof type === "string") {
      Object.assign(addr, { [type]: false });
    }
  });

  // TODO: revisit why we update Meteor.users differently than accounts
  // We could possibly remove the whole `userUpdateQuery` variable
  // and update Meteor.users with the accountsUpdateQuery data
  const userUpdateQuery = {
    $set: {
      "profile.addressBook": address
    }
  };

  const accountsUpdateQuery = {
    $set: {
      "profile.addressBook": account.profile.addressBook
    }
  };
  // update the name when there is no name or the user updated his only shipping address
  if (!account.name || _.get(account, "profile.addressBook.length", 0) <= 1) {
    userUpdateQuery.$set.name = address.fullName;
    accountsUpdateQuery.$set.name = address.fullName;
  }

  // Update the Meteor.users collection with new address info
  Meteor.users.update({ _id: userId }, userUpdateQuery);

  // Update the Reaction Accounts collection with new address info
  const updatedAccountResult = Accounts.update({
    userId
  }, accountsUpdateQuery);

  if (updatedAccountResult !== 1) {
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

  const updatedAccount = Accounts.findOne({ userId });
  Promise.await(appEvents.emit("afterAccountUpdate", {
    updatedAccount,
    updatedBy: authUserId,
    updatedFields
  }));

  // If the address update was successful, then return the full updated address.
  // Since we just pushed into `profile.addressBook`, we know it will exist.
  return updatedAccount.profile.addressBook.find((updatedAddress) => address._id === updatedAddress._id);
}
