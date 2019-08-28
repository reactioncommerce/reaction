import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  decodedAccountId: String,
  decodedGroupId: String
});
/**
 * @name accounts/removeAccountFromGroup
 * @memberof Mutations/Accounts
 * @summary Removes a user from a group for a shop, and adds them to the default customer group.
 * Updates the user's permission list to reflect.
 * (NB: At this time, a user only belongs to only one group per shop)
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Necessary input for mutation. See SimpleSchema.
 * @param {String} input.decodedAccountId - optional decoded ID of account on which entry should be updated, for admin
 * @param {String} input.decodedGroupId - decoded ID of the group to remove account from
 * @returns {Promise<Object>} with modified group
 */
export default async function removeAccountFromGroup(context, input) {
  inputSchema.validate(input);
  const { appEvents, collections, userHasPermission, userId: userIdFromContext } = context;
  const { Accounts, Groups } = collections;
  const {
    decodedAccountId,
    decodedGroupId: groupId
  } = input;

  const account = await Accounts.findOne({ _id: decodedAccountId });
  const { shopId } = await Groups.findOne({ _id: groupId }) || {};
  const defaultCustomerGroupForShop = await Groups.findOne({ slug: "customer", shopId }) || {};

  // we are limiting group method actions to only users with admin roles
  // this also include shop owners, since they have the `admin` role in their Roles.GLOBAL_GROUP
  if (!userHasPermission(["admin"], shopId)) {
    throw new ReactionError("access-denied", "Access denied");
  }

  if (!account) throw new ReactionError("not-found", "No account found");

  const { value: updatedAccount } = await Accounts.findOneAndUpdate({
    _id: decodedAccountId,
    groups: groupId
  }, {
    $set: { "groups.$": defaultCustomerGroupForShop._id }
  });

  if (!updatedAccount) {
    throw new ReactionError("server-error", "Unable to remove account from group");
  }

  await appEvents.emit("afterAccountUpdate", {
    account: updatedAccount,
    updatedBy: userIdFromContext,
    updatedFields: ["groups"]
  });

  return defaultCustomerGroupForShop;
}
