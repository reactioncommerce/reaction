import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import {
  defaultShopOwnerRoles,
  defaultShopManagerRoles
} from "../util/defaultRoles.js";

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
  const {
    collections: {
      Groups,
      Shops
    }
  } = context;

  const roles = {
    "shop manager": defaultShopManagerRoles,
    "owner": defaultShopOwnerRoles
  };

  const primaryShop = await Shops.findOne({ shopType: "primary" });

  const promises = Object.keys(roles).map(async (slug) => {
    const existingGroup = await Groups.findOne({ shopId, slug });
    if (!existingGroup) { // create group only if it doesn't exist before
      Logger.debug(`creating group ${slug} for shop ${shopId}`);
      // get roles from the default groups of the primary shop; we try to use this first before using default roles
      const primaryShopGroup = primaryShop ? await Groups.findOne({ shopId: primaryShop._id, slug }) : null;
      await Groups.insertOne({
        _id: Random.id(),
        name: slug,
        slug,
        permissions: (primaryShopGroup && primaryShopGroup.permissions) || roles[slug],
        shopId
      });
    }
  });

  await Promise.all(promises);
}
