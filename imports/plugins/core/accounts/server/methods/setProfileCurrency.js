import Hooks from "@reactioncommerce/hooks";
import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Accounts, Shops } from "/lib/collections";
import Reaction from "/server/api/core";

/**
 * @name accounts/setProfileCurrency
 * @memberof Accounts/Methods
 * @method
 * @param {String} currencyName - currency symbol to add to user profile
 * @param {String} [accountId] - accountId of user to set currency of. Defaults to current user ID
 * @summary Sets users profile currency
 * @returns {Object} Account document
 */
export default function setProfileCurrency(currencyName, accountId) {
  check(currencyName, String);
  check(accountId, Match.Maybe(String));

  const currentUserId = this.userId;
  const userId = accountId || currentUserId;
  if (!userId) throw new Meteor.Error("access-denied", "You must be logged in to set profile currency");

  const account = Accounts.findOne({ userId }, { fields: { shopId: 1 } });
  if (!account) throw new Meteor.Error("not-found", "Account not found");

  if (userId !== currentUserId && !Reaction.hasPermission("reaction-accounts", currentUserId, account.shopId)) {
    throw new Meteor.Error("access-denied", "Access denied");
  }

  // Make sure this currency code is in the related shop currencies list
  const shop = Shops.findOne({ _id: account.shopId }, { fields: { currencies: 1 } });

  if (!shop || !shop.currencies || !shop.currencies[currencyName]) {
    throw new Meteor.Error("invalid-argument", `The shop for this account does not define any currency with code "${currencyName}"`);
  }

  Accounts.update({ userId }, { $set: { "profile.currency": currencyName } });
  Hooks.Events.run("afterAccountsUpdate", userId, {
    accountId: account._id,
    updatedFields: ["currency"]
  });

  return Accounts.findOne({ userId });
}
