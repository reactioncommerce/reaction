import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import sendVerificationEmail from "../util/sendVerificationEmail.js";

const inputSchema = new SimpleSchema({
  accountId: String,
  email: SimpleSchema.RegEx.Email
});

/**
 * @name accounts/addAccountEmailRecord
 * @memberof Mutations/Accounts
 * @summary adds a new email to the user's profile
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Necessary input for mutation. See SimpleSchema.
 * @param {String} input.accountId - decoded ID of account on which entry should be added
 * @param {String} input.email - the email to add to the account
 * @returns {Promise<Object>} account with addd email
 */
export default async function addAccountEmailRecord(context, input) {
  inputSchema.validate(input);
  const { appEvents, collections, userId } = context;
  const { Accounts } = collections;
  const {
    accountId,
    email
  } = input;

  const account = await Accounts.findOne({ _id: accountId });
  if (!account) throw new ReactionError("not-found", "Account not Found");

  await context.validatePermissions(`reaction:legacy:accounts:${accountId}`, "add:emails", {
    shopId: account.shopId,
    owner: account.userId
  });

  const existingEmail = (account.emails || []).find(({ address }) => address === email);
  if (existingEmail) {
    throw new ReactionError("duplicate", "Account already has this email address");
  }

  // add email to Account
  const { value: updatedAccount } = await Accounts.findOneAndUpdate(
    { _id: accountId },
    {
      $addToSet: {
        emails: {
          address: email,
          provides: "default",
          verified: false
        }
      }
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
