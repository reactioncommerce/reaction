import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  accountId: {
    type: String,
    optional: true
  },
  email: String
});

/**
 * @name accounts/setAccountDefaultEmail
 * @memberof Mutations/Accounts
 * @summary Update default email in account
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Necessary input for mutation. See SimpleSchema.
 * @param {String} [input.accountId] - decoded ID of account on which entry should be updated
 * @param {String} input.email - the email to set as the default from the account
 * @returns {Promise<Object>} account with updated default email
 */
export default async function setAccountDefaultEmail(context, input) {
  inputSchema.validate(input);
  const {
    accountId: accountIdFromContext,
    appEvents,
    collections: {
      Accounts
    },
    userId
  } = context;
  const { email: newDefaultEmail } = input;

  // If no account ID input, default to the account that's calling
  const accountId = input.accountId || accountIdFromContext;

  const account = await Accounts.findOne({ _id: accountId });
  if (!account) throw new ReactionError("not-found", "Account not Found");

  await context.validatePermissions(`reaction:legacy:accounts:${accountId}`, "update:emails", {
    owner: account.userId
  });

  const existingEmail = (account.emails || []).find(({ address }) => address === newDefaultEmail);
  if (!existingEmail) {
    throw new ReactionError("invalid-param", "Email address is not associated with this account");
  }

  if (existingEmail.provides === "default") {
    throw new ReactionError("invalid-param", "Email is already default address for this account");
  }

  // remove `provides: default` from any email address which
  // had it and set `provides: default` to new email
  const emails = (account.emails || []).map((eml) => {
    if (eml.address === newDefaultEmail) {
      eml.provides = "default";
    } else {
      delete eml.provides;
    }
    return eml;
  });

  // update emails on Account
  const { value: updatedAccount } = await Accounts.findOneAndUpdate(
    { _id: accountId },
    {
      $set: { emails }
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
