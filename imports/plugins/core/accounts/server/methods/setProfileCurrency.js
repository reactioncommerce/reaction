import { check, Match } from "meteor/check";
import { Accounts, Shops } from "/lib/collections";
import appEvents from "/imports/node-app/core/util/appEvents";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";

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
  if (!userId) throw new ReactionError("access-denied", "You must be logged in to set profile currency");

  const account = Accounts.findOne({ userId }, { fields: { shopId: 1 } });
  if (!account) throw new ReactionError("not-found", "Account not found");

  if (userId !== currentUserId && !Reaction.hasPermission("reaction-accounts", currentUserId, account.shopId)) {
    throw new ReactionError("access-denied", "Access denied");
  }

  // Make sure this currency code is in the related shop currencies list
  const shop = Shops.findOne({ _id: account.shopId }, { fields: { currencies: 1 } });

  if (!shop || !shop.currencies || !shop.currencies[currencyName]) {
    throw new ReactionError("invalid-argument", `The shop for this account does not define any currency with code "${currencyName}"`);
  }

  Accounts.update({ userId }, { $set: { "profile.currency": currencyName } });

  const updatedAccount = Accounts.findOne({ userId });
  Promise.await(appEvents.emit("afterAccountUpdate", {
    account: updatedAccount,
    updatedBy: currentUserId,
    updatedFields: ["profile.currency"]
  }));

  return updatedAccount;
}
