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
  const { appEvents, collections, userHasPermission, userId: userIdFromContext } = context;
  const { Accounts, users } = collections;
  const {
    accountId,
    email
  } = input;

  const account = await Accounts.findOne({ "_id": accountId, "emails.address": email });
  if (!account) throw new ReactionError("not-found", "Account not Found");

  const user = await users.findOne({ "_id": account.userId, "emails.address": email });
  if (!user) throw new ReactionError("not-found", "User not Found");

  if (!context.isInternalCall && userIdFromContext !== account.userId) {
    if (!userHasPermission(["reaction-accounts"], account.shopId)) throw new ReactionError("access-denied", "Access denied");
  }

  // Remove email from user
  // This is the same as `MeteorAccounts.removeEmail(userId, email)
  const { value: updatedUser } = await users.findOneAndUpdate(
    { _id: user._id },
    {
      $pull: { emails: { address: email } }
    },
    {
      returnOriginal: false
    }
  );

  if (!updatedUser) throw new ReactionError("server-error", "Unable to update User");

  // Remove email from Account
  const { value: updatedAccount } = await Accounts.findOneAndUpdate(
    { _id: accountId },
    {
      $set: {
        emails: updatedUser.emails
      }
    },
    {
      returnOriginal: false
    }
  );

  if (!updatedAccount) throw new ReactionError("server-error", "Unable to update Account");

  sendVerificationEmail(context, {
    bodyTemplate: "accounts/verifyUpdatedEmail",
    userId: user._id
  });

  await appEvents.emit("afterAccountUpdate", {
    account: updatedAccount,
    updatedBy: accountId,
    updatedFields: ["emails"]
  });

  return updatedAccount;
}
