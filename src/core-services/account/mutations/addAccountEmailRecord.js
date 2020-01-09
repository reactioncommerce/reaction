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
  const { appEvents, collections } = context;
  const { Accounts, users } = collections;
  const {
    accountId,
    email
  } = input;

  const account = await Accounts.findOne({ _id: accountId });
  if (!account) throw new ReactionError("not-found", "Account not Found");

  const user = await users.findOne({ _id: account.userId });
  if (!user) throw new ReactionError("not-found", "User not Found");

  await context.validatePermissions(`reaction:legacy:accounts:${account._id}`, "add:emails", {
    shopId: account.shopId,
    owner: account.userId
  });

  // add email to user
  const { value: updatedUser } = await users.findOneAndUpdate(
    { _id: user._id },
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

  if (!updatedUser) throw new ReactionError("server-error", "Unable to update User");

  // add email to Account
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
