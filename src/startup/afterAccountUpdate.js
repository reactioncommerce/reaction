import Logger from "@reactioncommerce/logger";

/**
 * @name afterAccountUpdate
 * @summary Called on startup
 * @param {Object} context App context
 * @returns {undefined}
 */
export default async function afterAccountUpdate(context) {
  const { collections } = context;
  const { Groups } = collections;

  context.appEvents.on("afterAccountUpdate", async (payload) => {
    const {
      account,
      updatedFields
    } = payload;

    if (!Array.isArray(updatedFields) || !updatedFields.includes("groups")) {
      Logger.debug("Account update doesn't affect groups");

      // early return because this account's groups weren't affected by the update
      return;
    }

    const accountGroups = await Groups.find({
      _id: {
        $in: account.groups
      }
    }).toArray();

    // get an array of shop
    const adminShopIds = accountGroups.filter((group) => ["owner", "shop manager"].includes(group.slug) && group.shopId)
      .map((group) => group.shopId)
      .filter((shopId, index, shopIds) => shopIds.indexOf((shopId)) === index);

    const promises = adminShopIds.map((adminShopId) => context.mutations.grantAdminUIAccess(context.getInternalContext(), {
      accountId: account._id,
      shopId: adminShopId
    }));

    await Promise.all(promises);
  });
}
