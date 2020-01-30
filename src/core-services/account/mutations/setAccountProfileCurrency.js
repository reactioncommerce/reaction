import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import CurrencyDefinitions from "@reactioncommerce/api-utils/CurrencyDefinitions.js";

const inputSchema = new SimpleSchema({
  currencyCode: String,
  accountId: {
    type: String,
    optional: true
  }
});

/**
 * @name accounts/setAccountProfileCurrency
 * @memberof Mutations/Accounts
 * @summary Sets account profile currency
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Necessary input for mutation. See SimpleSchema.
 * @param {String} input.currencyCode - currency symbol to add to user profile
 * @param {String} [input.accountId] - optional decoded ID of account on which entry should be updated, for admin
 * @returns {Promise<Object>} with updated address
 */
export default async function setAccountProfileCurrency(context, input) {
  inputSchema.validate(input);
  const { appEvents, collections, accountId: accountIdFromContext, userId } = context;
  const { Accounts } = collections;
  const { currencyCode, accountId: providedAccountId } = input;

  const accountId = providedAccountId || accountIdFromContext;
  if (!accountId) throw new ReactionError("access-denied", "You must be logged in to set profile currency");

  const account = await Accounts.findOne({ _id: accountId }, { projection: { shopId: 1 } });
  if (!account) throw new ReactionError("not-found", "No account found");

  await context.validatePermissions(`reaction:legacy:accounts:${account._id}`, "update:currency", {
    owner: account.userId
  });

  if (!CurrencyDefinitions[currencyCode]) {
    throw new ReactionError("invalid-argument", `No currency has code "${currencyCode}"`);
  }

  const { value: updatedAccount } = await Accounts.findOneAndUpdate({
    _id: accountId
  }, {
    $set: { "profile.currency": currencyCode }
  }, {
    returnOriginal: false
  });

  await appEvents.emit("afterAccountUpdate", {
    account: updatedAccount,
    updatedBy: userId,
    updatedFields: ["profile.currency"]
  });

  return updatedAccount;
}
