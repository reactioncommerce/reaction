import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name afterShopCreate
 * @summary Called on startup
 * @param {Object} context App context
 * @returns {undefined}
 */
export default async function afterShopCreate(context) {
  const { collections } = context;
  const { Accounts } = collections;

  context.appEvents.on("afterShopCreate", async (payload) => {
    const {
      createdBy: userId,
      shop
    } = payload;

    const account = await Accounts.findOne({ userId });

    if (account === undefined) {
      throw new ReactionError("not-found", `Could not find account for user ${userId} when granting admin UI access for shop ${shop._id}`);
    }

    await context.mutations.grantAdminUIAccess(context, {
      accountId: account._id,
      shopId: shop._id
    });
  });
}
