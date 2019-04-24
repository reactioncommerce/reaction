import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @name shop/updateShopUrls
 * @memberof Mutations/Accounts
 * @method
 * @summary Add a new address to an account
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - address
 * @return {Promise<Object>} with updated shop
 */
export default async function updateShopUrls(context, input) {
  const { collections, userHasPermission } = context;
  const { Shops } = collections;

  const {
    shopId,
    storefrontHomeUrl,
    storefrontOrderUrl,
    storefrontOrdersUrl,
    storefrontAccountProfileUrl
  } = input;

  // Check permission to make sure user is allowed to do this
  // Security check for admin access
  if (!userHasPermission(["owner", "admin"], shopId)) {
    throw new ReactionError("access-denied", "User does not have permission");
  }

  const { value: updatedShop } = await Shops.findOneAndUpdate(
    { _id: shopId },
    {
      $set: {
        storefrontUrls: {
          storefrontHomeUrl,
          storefrontOrderUrl,
          storefrontOrdersUrl,
          storefrontAccountProfileUrl
        },
        updatedAt: new Date()
      }
    },
    {
      returnOriginal: false
    }
  );

  return updatedShop;
}
