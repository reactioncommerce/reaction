import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name revokeAdminUIAccess
 * @summary Grants admin UI access to a user
 * @param {Object} context - GraphQL execution context
 * @param {String} input Input of revokeAdminUIAccess
 * @param {String} input.accountId Account ID to unassign the shop from
 * @param {String} input.shopId Shop ID to unassign from the account
 * @returns {Object} the up-to-date account object
 */
export default async function revokeAdminUIAccess(context, input) {
  const { collections } = context;
  const { Accounts, Shops } = collections;

  const { accountId, shopId } = input;

  const account = await Accounts.findOne({ _id: accountId });
  if (account === undefined) {
    throw new ReactionError("not-found", "Account not Found");
  }

  await context.validatePermissions(`reaction:plugin-admin-ui:admin-ui-access-permissions:${accountId}`, "update", {
    owner: account.userId
  });

  const shop = await Shops.findOne({ _id: shopId });
  if (shop === undefined) {
    throw new ReactionError("not-found", "Shop not found");
  }

  if (Array.isArray(account.adminUIShopIds) && !account.adminUIShopIds.includes(shopId)) {
    Logger.warn(`Can't remove ${shopId} from adminUIShopIds on account ${account._id} — this user doesn't have admin UI access for this shop`);

    return account;
  }

  const { value: updatedAccount } = await Accounts.findOneAndUpdate({ _id: accountId }, {
    $pull: {
      adminUIShopIds: shopId
    }
  }, {
    returnNewDocument: true
  });

  return updatedAccount;
}
