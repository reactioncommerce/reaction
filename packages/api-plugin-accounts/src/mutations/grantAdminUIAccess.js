import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name grantAdminUIAccess
 * @summary Grants admin UI access to a user
 * @param {Object} context - GraphQL execution context
 * @param {String} input Input of grantAdminUIAccess
 * @param {String} input.accountId Account ID to assign the shop to
 * @param {String} input.shopId Shop ID to assign to the account
 * @returns {Object} the up-to-date account object
 */
export default async function grantAdminUIAccess(context, input) {
  const { collections } = context;
  const { Accounts, Shops } = collections;

  const { accountId, shopId } = input;

  const account = await Accounts.findOne({ _id: accountId });
  if (account === undefined) {
    throw new ReactionError("not-found", "Account not Found");
  }

  // if this mutation is called by the system itself (for example in a startup function),
  // validatePermissions won't be available and we don't need to check for permissions
  if (context.validatePermissions !== undefined) {
    await context.validatePermissions(`reaction:plugin-admin-ui:admin-ui-access-permissions:${accountId}`, "update", {
      owner: account.userId
    });
  }

  const shop = await Shops.findOne({ _id: shopId });
  if (shop === undefined) {
    throw new ReactionError("not-found", "Shop not found");
  }

  if (Array.isArray(account.adminUIShopIds) && account.adminUIShopIds.includes(shopId)) {
    Logger.warn(`Can't add ${shopId} to adminUIShopIds for account ${account._id} — this user already has admin UI access for this shop`);

    return account;
  }

  let update;

  if (Array.isArray(account.adminUIShopIds)) {
    update = {
      $addToSet: {
        adminUIShopIds: shopId
      }
    };
  } else {
    update = {
      $set: {
        adminUIShopIds: [shopId]
      }
    };
  }

  const { value: updatedAccount } = await Accounts.findOneAndUpdate({ _id: accountId }, update, { returnNewDocument: true });

  return updatedAccount;
}
