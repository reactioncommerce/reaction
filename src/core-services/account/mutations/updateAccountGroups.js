import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  "groups": {
    type: Array, // groupIds that user belongs to
    optional: true,
    defaultValue: []
  },
  "groups.$": {
    type: String
  }
});

/**
 * @name accounts/updateAccountGroups
 * @memberof Mutations/Accounts
 * @summary Update an existing address on an account
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Necessary input for mutation. See SimpleSchema.
 * @param {Object} input.groups - groups to append to
 * @param {String} input.accountId - optional decoded ID of account on which entry should be updated, for admins
 * @returns {Promise<Object>} with updated account
 */
export default async function updateAccountGroups(context, input) {
  inputSchema.validate(input);
  const { appEvents, checkPermissions, collections, userId: userIdFromContext } = context;
  const { Accounts } = collections;
  const { groups, accountId } = input;

  const account = await Accounts.findOne({ _id: accountId });

  if (!account) throw new ReactionError("not-found", "No account found");

  if (!context.isInternalCall && userIdFromContext !== accountId) {
    await checkPermissions(["reaction-accounts"], account.shopId);
  }

  const accountsUpdateQuery = {
    $addToSet: {
      groups: {
        $each: groups
      }
    }
  };


  // Update the Reaction Accounts collection with new groups info
  const { value: updatedAccount } = await Accounts.findOneAndUpdate(
    {
      _id: accountId
    },
    accountsUpdateQuery,
    {
      returnOriginal: false
    }
  );

  if (!updatedAccount) {
    throw new ReactionError("server-error", "Unable to update account groups");
  }

  // Create an array which contains all fields that have changed
  // This is used for search, to determine if we need to re-index
  const updatedFields = ["groups"];

  await appEvents.emit("afterAccountUpdate", {
    account: updatedAccount,
    updatedBy: userIdFromContext,
    updatedFields
  });

  return updatedAccount;
}
