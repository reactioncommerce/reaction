import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  currencyCode: String,
  decodedAccountId: String
});

/**
 * @name accounts/setAccountProfileCurrency
 * @memberof Mutations/Accounts
 * @summary Sets users profile currency
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Necessary input for mutation. See SimpleSchema.
 * @param {String} input.currencyCode - currency symbol to add to user profile
 * @param {String} [input.decodedAccountId] - optional decoded ID of account on which entry should be updated, for admin
 * @returns {Promise<Object>} with updated address
 */
export default async function setAccountProfileCurrency(context, input) {
  inputSchema.validate(input);
  const { appEvents, collections, userHasPermission, userId: userIdFromContext } = context;
  const { Accounts, Shops } = collections;
  const { currencyCode, decodedAccountId } = input;

  const accountId = decodedAccountId || userIdFromContext;
  if (!accountId) throw new ReactionError("access-denied", "You must be logged in to set profile currency");

  const account = await Accounts.findOne({ _id: accountId }, { fields: { shopId: 1 } });
  if (!account) throw new ReactionError("not-found", "No account found");

  if (userIdFromContext !== decodedAccountId) {
    if (!userHasPermission(["reaction-accounts"], account.shopId)) throw new ReactionError("access-denied", "Access denied");
  }

  // Make sure this currency code is in the related shop currencies list
  const shop = await Shops.findOne({ _id: account.shopId }, { fields: { currencies: 1 } });

  if (!shop || !shop.currencies || !shop.currencies[currencyCode]) {
    throw new ReactionError("invalid-argument", `The shop for this account does not define any currency with code "${currencyCode}"`);
  }

  const { value: updatedAccount } = await Accounts.findOneAndUpdate({ _id: accountId }, { $set: { "profile.currency": currencyCode } });

  await appEvents.emit("afterAccountUpdate", {
    account: updatedAccount,
    updatedBy: accountId,
    updatedFields: ["profile.currency"]
  });

  return updatedAccount;
}
