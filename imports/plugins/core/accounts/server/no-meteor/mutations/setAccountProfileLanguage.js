import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  language: String,
  accountId: {
    type: String,
    optional: true
  }
});

/**
 * @name accounts/setAccountProfileLanguage
 * @memberof Mutations/Accounts
 * @summary Sets users profile language
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Necessary input for mutation. See SimpleSchema.
 * @param {String} input.language- i18n language code to add to user profile
 * @param {String} [input.accountId] - optional decoded ID of account on which entry should be updated
 * @returns {Object} Account document with updated profile language
 */
export default async function setAccountProfileLanguage(context, input) {
  inputSchema.validate(input);
  const {
    accountId: accountIdFromContext,
    appEvents,
    collections,
    userHasPermission,
    userId: userIdFromContext
  } = context;
  const { Accounts, Shops } = collections;
  const { language, accountId: providedAccountId } = input;
  const accountId = providedAccountId || accountIdFromContext;

  if (!accountId) throw new ReactionError("access-denied", "You must be logged in to set profile language");

  const account = await Accounts.findOne({ _id: accountId }, { projection: { shopId: 1 } });
  if (!account) throw new ReactionError("not-found", "No account found");

  if (!context.isInternalCall && accountIdFromContext !== accountId) {
    if (!userHasPermission(["reaction-accounts"], account.shopId)) throw new ReactionError("access-denied", "Access denied");
  }

  // Make sure this language is in the related shop languages list
  const shop = await Shops.findOne({ _id: account.shopId }, { projection: { languages: 1 } });
  if (!shop || !shop.languages || !isLanguageEnabled(shop.languages, language)) {
    throw new ReactionError("invalid-argument", `Shop does not define any enabled language with code "${language}"`);
  }

  const { value: updatedAccount } = await Accounts.findOneAndUpdate(
    { _id: accountId },
    { $set: { "profile.language": language } },
    { returnOriginal: false }
  );

  await appEvents.emit("afterAccountUpdate", {
    account: updatedAccount,
    updatedBy: userIdFromContext,
    updatedFields: ["profile.language"]
  });

  return updatedAccount;
}

/**
 * @summary Checks whether language is in languages and is enabled
 * @param {Object[]} languages - shop languages
 * @param {Boolean} languages[].enabled - true if enabled false if disabled
 * @param {String} languages[].i18n - code of language
 * @param {String} language - i18n code of language
 * @returns {Boolean} - true if language is enabled exists in languages array
 */
function isLanguageEnabled(languages, language) {
  return !!languages.find(({ enabled, i18n }) => enabled === true && i18n === language);
}
