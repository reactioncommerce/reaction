import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name shop/updateShopLogoUrls
 * @memberof Mutations/Shop
 * @method
 * @summary Add shop logo Urls to a shop
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - an object of all mutation arguments that were sent
 * @param {String} input.shopId - The shop ID
 * @param {Object} input.shopLogoUrls - An object containing the Urls to update
 * @return {Promise<Object>} with updated shop
 */
export default async function updateShopLogoUrls(context, input) {
  const { collections, userHasPermission } = context;
  const { Shops } = collections;

  const {
    shopId,
    shopLogoUrls
  } = input;


  // Only update provided fields inside `shopLogoUrls`,
  // don't update the whole object
  const sets = {};
  Object.keys(shopLogoUrls).forEach((key) => {
    sets[`shopLogoUrls.${key}`] = shopLogoUrls[key];
  });

  // Check permission to make sure user is allowed to do this
  // Security check for admin access
  if (!userHasPermission(["owner", "admin"], shopId)) {
    throw new ReactionError("access-denied", "User does not have permission");
  }

  const { value: updatedShop } = await Shops.findOneAndUpdate(
    { _id: shopId },
    {
      $set: {
        ...sets,
        updatedAt: new Date()
      }
    },
    {
      returnOriginal: false
    }
  );

  return updatedShop;
}
