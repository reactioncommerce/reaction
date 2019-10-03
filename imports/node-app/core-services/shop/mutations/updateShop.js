import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import { ShopLogoUrls, StorefrontUrls } from "../simpleSchemas.js";

const inputSchema = new SimpleSchema({
  shopId: String,
  shopLogoUrls: {
    type: ShopLogoUrls,
    optional: true
  },
  storefrontUrls: {
    type: StorefrontUrls,
    optional: true
  }
});

/**
 * @name shop/updateShop
 * @memberof Mutations/Shop
 * @method
 * @summary Updates data on the Shop object
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - an object of all mutation arguments that were sent
 * @param {String} input.shopId - The shop ID
 * @param {Object} input.shopLogoUrls - An object containing the shop logo urls to update
 * @param {Object} input.storefrontUrls - An object containing storefront url locations
 * @returns {Promise<Object>} with updated shop
 */
export default async function updateShop(context, input) {
  const { collections, userHasPermission } = context;
  const { Shops } = collections;

  inputSchema.validate(input || {});

  const {
    shopId,
    shopLogoUrls,
    storefrontUrls
  } = input;

  // set data to update
  const sets = {};

  // Only update provided fields inside `objects`,
  if (shopLogoUrls) {
    Object.keys(shopLogoUrls).forEach((key) => {
      sets[`shopLogoUrls.${key}`] = shopLogoUrls[key];
    });
  }

  if (storefrontUrls) {
    Object.keys(storefrontUrls).forEach((key) => {
      sets[`storefrontUrls.${key}`] = storefrontUrls[key];
    });
  }

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
