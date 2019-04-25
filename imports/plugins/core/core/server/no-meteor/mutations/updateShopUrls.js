import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name shop/updateShopUrls
 * @memberof Mutations/Accounts
 * @method
 * @summary Add storefront Urls to a shop
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - an object of all mutation arguments that were sent
 * @param {String} args.input.shopId - The shop ID
 * @param {Object} args.input.storefrontUrls - An object containing the Urls to update
 * @return {Promise<Object>} with updated shop
 */
export default async function updateShopUrls(context, input) {
  const { collections, userHasPermission } = context;
  const { Shops } = collections;

  const {
    shopId,
    storefrontUrls
  } = input;

  // Only update provided fields inside `storefrontUrls`,
  // don't update the whole object
  const sets = {};
  Object.keys(storefrontUrls).forEach((key) => {
    sets[`storefrontUrls.${key}`] = storefrontUrls[key];
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
