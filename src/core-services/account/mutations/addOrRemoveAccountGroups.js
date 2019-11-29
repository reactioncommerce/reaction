import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import AddOrRemoveAccountGroupsOperationType from "./AddOrRemoveAccountGroupsOperationType.js";

const inputSchema = new SimpleSchema({
  "accountId": String,
  "userId": String,
  "groups": {
    type: Array, // groupIds that user belongs to
    optional: true,
    defaultValue: []
  },
  "groups.$": {
    type: String
  }
});


const getQueryAndOption = (updateGroupOperationType, groups) => {
  let queryAndOptions = null;
  switch (updateGroupOperationType) {
    case AddOrRemoveAccountGroupsOperationType.ADD: {
      queryAndOptions = {
        query: {
          $addToSet: {
            groups: {
              $each: groups
            }
          }
        },
        options: {
          returnOriginal: false
        }

      };
      break;
    }
    case AddOrRemoveAccountGroupsOperationType.DELETE: {
      queryAndOptions = {
        query: {
          $pull: {
            groups: {
              $in: groups
            }
          }
        },
        options: {
          multi: true
        }
      };
      break;
    }
    default: return queryAndOptions;
  }

  return queryAndOptions;
};
/**
 * @name accounts/addOrRemoveAccountGroups
 * @memberof Mutations/Accounts
 * @summary Adds or removes  groups on an account
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Necessary input for mutation. See SimpleSchema.
 * @param {AddOrRemoveAccountGroupsOperationType} updateGroupOperationType - the type of operation to perform.
 * @param {Object} input.groups - groups to append to
 * @param {String} input.accountId - optional decoded ID of account on which entry should be updated, for admins
 * @returns {Promise<Object>} with updated account
 */
export default async function addOrRemoveAccountGroups(context, input, updateGroupOperationType) {
  // inputSchema.validate(context);
  const { appEvents, checkPermissions, collections, userId: userIdFromContext } = context;
  const { Accounts } = collections;
  const { accountId } = context;
  const { groups } = input;

  const account = await Accounts.findOne({ _id: accountId });

  if (!account) throw new ReactionError("not-found", "No account found");

  if (!context.isInternalCall && userIdFromContext !== accountId) {
    await checkPermissions(["reaction-accounts"], account.shopId);
  }

  const accountUpdateQueryOptions = getQueryAndOption(updateGroupOperationType, groups);

  // Update the Reaction Accounts collection with new groups info
  // This
  const { value: updatedAccount } = await Accounts.findOneAndUpdate(
    {
      _id: accountId
    },
    accountUpdateQueryOptions.query,
    accountUpdateQueryOptions.options
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
