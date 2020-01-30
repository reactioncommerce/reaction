import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  accountId: {
    type: String,
    optional: true
  },
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
  const { accountId: accountIdFromContext, appEvents, collections, userId } = context;
  const { Accounts } = collections;
  const { email } = input;

  // If no account ID input, default to the account that's calling
  const accountId = input.accountId || accountIdFromContext;

  const account = await Accounts.findOne({ _id: accountId });
  if (!account) throw new ReactionError("not-found", "Account not Found");

  await context.validatePermissions(`reaction:legacy:accounts:${accountId}`, "add:emails", {
    owner: account.userId
  });

  const existingEmail = (account.emails || []).find(({ address }) => address === email);
  if (existingEmail) {
    throw new ReactionError("duplicate", "Account already has this email address");
  }

  const emails = {
    address: email,
    verified: false
  };

  const isDefaultEmailSet = (account.emails || []).some(({ provides }) => provides === "default");

  if (!isDefaultEmailSet) {
    emails.provides = "default";
  }

  // add email to Account
  const { value: updatedAccount } = await Accounts.findOneAndUpdate(
    { _id: accountId },
    {
      $addToSet: {
        emails
      }
    },
    {
      returnOriginal: false
    }
  );

  if (!updatedAccount) throw new ReactionError("server-error", "Unable to update Account");

  await appEvents.emit("afterAccountUpdate", {
    account: updatedAccount,
    updatedBy: userId,
    updatedFields: ["emails"]
  });

  return updatedAccount;
}
