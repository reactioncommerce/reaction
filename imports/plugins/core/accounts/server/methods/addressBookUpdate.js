import _ from "lodash";
import Hooks from "@reactioncommerce/hooks";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Accounts, Cart } from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";
import Reaction from "/server/api/core";

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
  check(accountUserId, Match.OneOf(String, null, undefined));
  check(type, Match.Maybe(String));
  // security, check for admin access. We don't need to check every user call
  // here because we are calling `Meteor.userId` from within this Method.
  if (typeof accountUserId === "string") { // if this will not be a String -
    // `check` will not pass it.
    if (Meteor.userId() !== accountUserId && !Reaction.hasPermission("reaction-accounts")) {
      throw new Meteor.Error("access-denied", "Access denied");
    }
  }
  this.unblock();

  // If no userId is provided, use the current user
  const userId = accountUserId || Meteor.userId();
  // Find old state of isShippingDefault & isBillingDefault to compare and reflect in cart
  const account = Accounts.findOne({ userId });
  const oldAddress = (account.profile.addressBook || []).find((addr) => addr._id === address._id);

  if (!oldAddress) throw new Meteor.Error("not-found", `No existing address found with ID ${address._id}`);

  // Set new address to be default for `type`
  if (typeof type === "string") {
    Object.assign(address, { [type]: true });
  }

  // We want the cart addresses to be updated when current default address
  // (shipping or Billing) are different than the previous one, but also
  // when the current default address(ship or bill) gets edited(so Current and Previous default are the same).
  // This check can be simplified to :
  if (address.isShippingDefault || address.isBillingDefault ||
    oldAddress.isShippingDefault || oldAddress.isBillingDefault) {
    // Find user cart
    // Cart should exist to this moment, so we don't need to to verify its existence.
    const cart = Cart.findOne({ userId });

    // If isShippingDefault address has changed
    if (oldAddress.isShippingDefault !== address.isShippingDefault) {
      // Update the cart to use new default shipping address
      if (address.isShippingDefault) {
        Meteor.call("cart/setShipmentAddress", cart._id, address);
      } else {
        // If the new address is not the shipping default, remove it from the cart
        Meteor.call("cart/unsetAddresses", address._id, userId, "shipping");
      }
    } else if (address.isShippingDefault && oldAddress.isShippingDefault) {
      // If shipping address was edited, but isShippingDefault status not changed, update the cart address
      Meteor.call("cart/setShipmentAddress", cart._id, address);
    }

    // If isBillingDefault address has changed
    if (oldAddress.isBillingDefault !== address.isBillingDefault) {
      // Update the cart to use new default billing address
      if (address.isBillingDefault) {
        Meteor.call("cart/setPaymentAddress", cart._id, address);
      } else {
        // If the new address is not the shipping default, remove it from the cart
        Meteor.call("cart/unsetAddresses", address._id, userId, "billing");
      }
    } else if (address.isBillingDefault && oldAddress.isBillingDefault) {
      // If shipping address was edited, but isShippingDefault status not changed, update the cart address
      Meteor.call("cart/setPaymentAddress", cart._id, address);
    }
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
  Meteor.users.update(Meteor.userId(), userUpdateQuery);

  // Update the Reaction Accounts collection with new address info
  const updatedAccountResult = Accounts.update({
    userId
  }, accountsUpdateQuery);

  // Create an array which contains all fields that have changed
  // This is used for search, to determine if we need to re-index
  const updatedFields = [];
  Object.keys(address).forEach((key) => {
    if (address[key] !== oldAddress[key]) {
      updatedFields.push(key);
    }
  });

  // Run afterAccountsUpdate hook to update Accounts Search
  Hooks.Events.run("afterAccountsUpdate", Meteor.userId(), {
    accountId: account._id,
    updatedFields
  });

  // If the address update was successful, then return the full updated addrtess
  if (updatedAccountResult === 1) {
    // Find the account
    const updatedAccount = Accounts.findOne({
      userId
    });

    // Pull the updated address and return it
    return updatedAccount.profile.addressBook.find((updatedAddress) => address._id === updatedAddress._id);
  }

  throw new Meteor.Error("server-error", "Unable to update account address");
}
