import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  accountId: String,
  groupSlug: String,
  shopId: String
});

/**
 * @name accounts/addAccountToGroupBySlug
 * @memberof Mutations/Accounts
 * @method
 * @summary Add an account to a group
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Input arguments
 * @param {String} input.accountId - The account ID
 * @param {String} input.groupSlug - The group slug
 * @param {String} input.shopId - The shop ID that owns the auth group
 * @return {Promise<Object>} with updated address
 */
export default async function addAccountToGroupBySlug(context, input) {
  inputSchema.validate(input);

  const { accountId, groupSlug, shopId } = input;
  const { collections: { Groups } } = context;

  const group = await Groups.findOne({
    shopId,
    slug: groupSlug
  }, {
    projection: {
      _id: 1
    }
  });

  if (!group) throw new ReactionError("not-found", `Can't find ${groupSlug} group for shop ID ${shopId}`);

  return context.mutations.addAccountToGroup(context, { accountId, groupId: group._id });
}
