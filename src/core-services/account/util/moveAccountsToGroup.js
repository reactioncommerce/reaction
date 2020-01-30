import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";

const logCtx = { name: "core/accounts", file: " executeBulkOperation" };

/**
 * @name moveAccountsToGroup
 * @private
 * @summary Move all accounts from a specified group to another group.
 * @param {Object} context App context
 * @param {String} input.shopId - Shop to perform the move within. Both groups must be on the same shop.
 * @param {String} input.fromGroupId - Group to move accounts from
 * @param {String} input.toGroupId - Group to move accounts to
 * @returns {undefined} Nothing
 */
export default async function moveAccountsToGroup(context, { shopId, fromGroupId, toGroupId }) {
  const { collections } = context;
  const { Accounts, Groups } = collections;

  const fromGroup = await Groups.findOne({ _id: fromGroupId, shopId });
  const toGroup = await Groups.findOne({ _id: toGroupId, shopId });

  if (!fromGroup) {
    throw new ReactionError("not-found", `Accounts cannot be moved from group ith ID ${fromGroupId}. Group doesn't exist.`);
  }

  if (!toGroup) {
    throw new ReactionError("not-found", `Accounts cannot be moved to group with ID ${toGroupId}. Group doesn't exist.`);
  }

  await context.validatePermissions("reaction:legacy:groups", "manage:accounts", { shopId });

  let response;
  try {
    Logger.trace({ ...logCtx }, `Processing bulk account group move from ${fromGroup.name} group to ${toGroup.name} group`);
    response = await Accounts.bulkWrite([
      // Add the new group to all accounts currently in the old group
      {
        updateMany: {
          filter: {
            groups: fromGroupId
          },
          update: {
            $addToSet: {
              groups: toGroupId
            }
          }
        }
      },
      // Remove the old groups from all matching accounts
      {
        updateMany: {
          filter: {
            groups: fromGroupId
          },
          update: {
            $pull: {
              groups: fromGroupId
            }
          }
        }
      }
    ], {
      ordered: false
    });
  } catch (error) {
    Logger.error({ ...logCtx, error }, "Account group move update failed");
    response = error; // error object has details about failed & successful operations
  }

  const { nMatched, nModified, result: { writeErrors } } = response;

  const cleanedErrors = writeErrors.map((error) => ({
    documentId: error.op._id,
    errorMsg: error.errmsg
  }));

  return {
    foundCount: nMatched,
    updatedCount: nModified,
    writeErrors: cleanedErrors
  };
}
