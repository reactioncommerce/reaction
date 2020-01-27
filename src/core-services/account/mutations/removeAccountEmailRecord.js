import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import sendVerificationEmail from "../util/sendVerificationEmail.js";

const inputSchema = new SimpleSchema({
  accountId: String,
  email: String
});

/**
 * @name accounts/removeAccountEmailRecord
 * @memberof Mutations/Accounts
 * @summary Remove existing email in user's profile
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Necessary input for mutation. See SimpleSchema.
 * @param {String} input.accountId - decoded ID of account on which entry should be updated
 * @param {String} input.email - the email to remove from the account
 * @returns {Promise<Object>} account with removed email
 */
export default async function removeAccountEmailRecord(context, input) {
  inputSchema.validate(input);
  const {
    appEvents,
    collections: {
      Accounts
    },
    userId
  } = context;
  const {
    accountId,
    email
  } = input;

  const account = await Accounts.findOne({ _id: accountId });
  if (!account) throw new ReactionError("not-found", "Account not Found");

  await context.validatePermissions(`reaction:legacy:accounts:${accountId}`, "delete:emails", {
    shopId: account.shopId,
    owner: account.userId
  });

  const existingEmail = (account.emails || []).find(({ address }) => address === email);
  if (!existingEmail) {
    throw new ReactionError("invalid-param", "Account does not have this email address");
  }

  // Remove email from Account
  const { value: updatedAccount } = await Accounts.findOneAndUpdate(
    { _id: accountId },
    {
      $pull: { emails: { address: email } }
    },
    {
      returnOriginal: false
    }
  );

  if (!updatedAccount) throw new ReactionError("server-error", "Unable to update Account");

  await sendVerificationEmail(context, {
    bodyTemplate: "accounts/verifyUpdatedEmail",
    userId: account.userId
  });

  await appEvents.emit("afterAccountUpdate", {
    account: updatedAccount,
    updatedBy: userId,
    updatedFields: ["emails"]
  });

  return updatedAccount;
}
