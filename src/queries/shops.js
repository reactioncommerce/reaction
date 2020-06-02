/**
 * @name shops
 * @summary Query the Shops collection for a list of shops.
 *   If shopIds are provided, return the matching shops. Otherwise, return all the shops.
 * @param {Object} context - an object containing the per-request state
 * @param {Object} args - an object of all arguments that were sent by the client
 * @param {String} [args.shopIds] - optional array of shop IDs to return
 * @returns {Promise<Object>} Products object Promise
 */
export default async function shops(context, { shopIds } = {}) {
  const { collections } = context;
  const { Shops } = collections;

  if (Array.isArray(shopIds)) {
    // make sure we're authorized to read all the requested shopIds
    for (const shopId of shopIds) {
      await context.validatePermissions(`reaction:legacy:shops:${shopId}`, "read", { shopId }); // eslint-disable-line no-await-in-loop
    }

    return Shops.find({
      _id: {
        $in: shopIds
      }
    });
  }

  await context.validatePermissions("reaction:legacy:shops", "read", { shopId: null });

  return Shops.find();
}
