import { check, Match } from "meteor/check";
import R from "ramda";
import { Accounts, Shops } from "/lib/collections";
import appEvents from "/imports/node-app/core/util/appEvents";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name accounts/setProfileLanguage
 * @memberof Accounts/Methods
 * @method
 * @param {String} languageCode - i18n language code
 * @param {String} [accountId] - accountId of user to set language of. Defaults to current user ID
 * @summary Sets users profile language
 * @returns {Object} Account document
 */
export default function setProfileLanguage(languageCode, accountId) {
  check(languageCode, String);
  check(accountId, Match.Maybe(String));

  const currentUserId = this.userId;
  const userId = accountId || currentUserId;
  if (!userId) throw new ReactionError("access-denied", "You must be logged in to set profile language");

  const account = Accounts.findOne({ userId }, { fields: { shopId: 1 } });
  if (!account) throw new ReactionError("not-found", "Account not found");

  if (userId !== currentUserId && !Reaction.hasPermission("reaction-accounts", currentUserId, account.shopId)) {
    throw new ReactionError("access-denied", "Access denied");
  }

  // first search for shop based on account id
  let shop = Shops.findOne({ _id: account.shopId }, { languages: 1 });

  if (!shop || !shop.languages || shop.languages.length === 0) {
    // if non-primary shop does not have any languages use primary shop
    shop = Shops.findOne({ shopType: "primary" }, { languages: 1 });
  }

  const shopLanguages = (shop && shop.languages) || [];
  const shopLanguage = R.find(R.whereEq({ enabled: true, i18n: languageCode }))(shopLanguages);

  if (!shopLanguage) {
    throw new ReactionError("invalid-argument", `Shop does not define any enabled language with code "${languageCode}"`);
  }

  Accounts.update({ userId }, { $set: { "profile.language": languageCode } });

  const updatedAccount = Accounts.findOne({ userId });
  Promise.await(appEvents.emit("afterAccountUpdate", {
    account: updatedAccount,
    updatedBy: currentUserId,
    updatedFields: ["profile.language"]
  }));

  return updatedAccount;
}
