import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";

const logCtx = { name: "core/accounts", file: " executeBulkOperation" };

/**
 * @name removeAccountsFromGroup
 * @private
 * @summary Remove all accounts from a specified group.
 * @param {Object} context App context
 * @param {String} input.shopId - Shop group belongs to
 * @param {String} input.fromGroupId - Group to remove accounts from
 * @returns {undefined} Nothing
 */
export default async function removeAccountsFromGroup(context, { shopId, fromGroupId }) {
  const { collections } = context;
  const { Accounts, Groups } = collections;

  const fromGroup = await Groups.findOne({ _id: fromGroupId, shopId });

  if (!fromGroup) {
    throw new ReactionError("not-found", `Accounts cannot be moved from group ith ID ${fromGroupId}. Group doesn't exist.`);
  }

  await context.validatePermissions("reaction:legacy:groups", "manage:accounts", { shopId });

  let response;
  try {
    Logger.trace({ ...logCtx }, `Processing bulk account group remove from ${fromGroup.name} group`);
    response = await Accounts.bulkWrite([
      // Remove the old group from all matching accounts
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
