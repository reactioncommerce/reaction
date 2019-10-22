import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  firstName: String,
  lastName: String,
  accountId: {
    type: String,
    optional: true
  }
});

/**
 * @name accounts/updateAccountName
 * @memberof Mutations/Accounts
 * @summary Updates users profile name
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Necessary input for mutation. See SimpleSchema.
 * @param {String} input.firstName - first name to update on the user profile
 * @param {String} input.lastName - last name to update on the user profile
 * @param {String} [input.accountId] - optional decoded ID of account on which entry should be updated, for admin
 * @returns {Promise<Object>} with updated name
 */
export default async function updateAccountName(context, input) {
  inputSchema.validate(input);
  const { appEvents, collections, userHasPermission, userId: userIdFromContext } = context;
  const { Accounts } = collections;
  const { firstName, lastName, accountId: providedAccountId } = input;

  const accountId = providedAccountId || userIdFromContext;
  if (!accountId) throw new ReactionError("access-denied", "You must be logged in to set profile name");

  const account = await Accounts.findOne({ _id: accountId }, { projection: { shopId: 1 } });
  if (!account) throw new ReactionError("not-found", "No account found");

  if (!context.isInternalCall && userIdFromContext !== providedAccountId) {
    if (!userHasPermission(["reaction-accounts"], account.shopId)) throw new ReactionError("access-denied", "Access denied");
  }

  const { value: updatedAccount } = await Accounts.findOneAndUpdate({
    _id: accountId
  }, {
    $set: {
      "profile.name": `${firstName} ${lastName}`,
      "profile.firstName": firstName,
      "profile.lastName": lastName
    }
  }, {
    returnOriginal: false
  });

  await appEvents.emit("afterAccountUpdate", {
    account: updatedAccount,
    updatedBy: accountId,
    updatedFields: ["profile.name", "profile.firstName", "profile.lastName"]
  });

  return updatedAccount;
}
