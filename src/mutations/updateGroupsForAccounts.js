import ReactionError from "@reactioncommerce/reaction-error";
import SimpleSchema from "simpl-schema";

const inputSchema = new SimpleSchema({
  accountIds: {
    type: Array
  },
  "accountIds.$": String,
  groupIds: {
    type: Array
  },
  "groupIds.$": String
});

/**
 * @name accounts/updateGroupsForAccounts
 * @memberof Mutations/Accounts
 * @method
 * @summary Bulk-update group assignments for specified accounts
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Input arguments
 * @param {String} input.accountIds - The account IDs
 * @param {String} input.groupIds - The group IDs
 * @return {Promise<Object>} accounts with updated groups
 */
export default async function updateGroupsForAccounts(context, input) {
  inputSchema.validate(input);

  const { accountIds, groupIds } = input;
  const {
    appEvents,
    collections: {
      Accounts,
      Groups
    },
    userId
  } = context;

  const groupsToAssignAccountsTo = await Groups.find({
    _id: {
      $in: groupIds
    }
  }).toArray();

  if (groupsToAssignAccountsTo.length === 0) {
    throw new ReactionError("not-found", "No groups matching the provided IDs were found");
  }

  if (groupsToAssignAccountsTo.length !== groupIds.length) {
    throw new ReactionError("not-found", `Could not find ${groupIds.length - groupsToAssignAccountsTo.length} of ${groupIds.length} groups provided`);
  }

  for (const group of groupsToAssignAccountsTo) {
    let groupShopId;

    if (group.shopId) {
      groupShopId = {
        shopId: group.shopId
      };
    }

    await context.validatePermissions("reaction:legacy:groups", "manage:accounts", groupShopId);
  }

  const accounts = await Accounts.find({
    _id: {
      $in: accountIds
    }
  }).toArray();

  if (accounts.length === 0) {
    throw new ReactionError("not-found", "No accounts matching the provided IDs were found");
  }

  if (accounts.length !== accountIds.length) {
    throw new ReactionError("not-found", `Could not find ${accountIds.length - accounts.length} of ${accountIds.length} groups provided`);
  }

  await Accounts.updateMany({
    _id: {
      $in: accountIds
    }
  }, {
    $set: {
      groups: groupIds,
      updatedAt: new Date()
    }
  });

  const updatedAccounts = await Accounts.find({
    _id: {
      $in: accountIds
    }
  }).toArray();

  for (let updatedAccount of updatedAccounts) {
    await appEvents.emit("afterAccountUpdate", {
      account: updatedAccount,
      updatedBy: userId,
      updatedFields: ["groups"]
    });
  }

  // Return the accounts that were updated
  return updatedAccounts;
}
