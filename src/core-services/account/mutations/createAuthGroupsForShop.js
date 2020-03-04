/**
 * @name createAuthGroupsForShop
 * @method
 * @memberof Core
 * @summary Creates all auth groups for a shop
 * @param {Object} context App context
 * @param {String} shopId ID of shop to create the group for
 * @returns {undefined}
 */
export default async function createAuthGroupsForShop(context, shopId) {
  const { collections: { Groups } } = context;

  const promises = ["shop manager", "owner"].map(async (slug) => {
    const existingGroup = await Groups.findOne({ shopId, slug });
    if (!existingGroup) {
      await context.mutations.createAccountGroup(context.getInternalContext(), {
        group: {
          name: slug,
          slug
        },
        shopId
      });
    }
  });

  await Promise.all(promises);
}
