import Hooks from "@reactioncommerce/hooks";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Accounts } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * @name accounts/addressBookRemove
 * @memberof Accounts/Methods
 * @method
 * @summary Remove existing address in user's profile
 * @param {String} addressId - address `_id`
 * @param {String} [accountUserId] - `account.userId` used by admin to edit users
 * @return {Object} Removed address object
 */
export default function addressBookRemove(addressId, accountUserId) {
  check(addressId, String);
  check(accountUserId, Match.Optional(String));
  // security, check for admin access. We don't need to check every user call
  // here because we are calling `Meteor.userId` from within this Method.
  if (typeof accountUserId === "string") { // if this will not be a String -
    // `check` will not pass it.
    if (Meteor.userId() !== accountUserId && !Reaction.hasPermission("reaction-accounts")) {
      throw new Meteor.Error("access-denied", "Access denied");
    }
  }
  this.unblock();

  const userId = accountUserId || Meteor.userId();
  const account = Accounts.findOne({ userId });

  const updatedAccountResult = Accounts.update({
    userId,
    "profile.addressBook._id": addressId
  }, {
    $pull: {
      "profile.addressBook": {
        _id: addressId
      }
    }
  }, { bypassCollection2: true });

  // forceIndex when removing an address
  Hooks.Events.run("afterAccountsUpdate", Meteor.userId(), {
    accountId: account._id,
    updatedFields: ["forceIndex"]
  });

  // If the address remove was successful, then return the removed addrtess
  if (updatedAccountResult === 1) {
    // Pull the address from the account before it was updated and return it
    return account.profile.addressBook.find((removedAddress) => addressId === removedAddress._id);
  }

  throw new Meteor.Error("server-error", "Unable to remove address from account");
}
