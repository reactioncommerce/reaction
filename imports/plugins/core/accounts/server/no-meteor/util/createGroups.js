import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";

const defaultCustomerRoles = ["guest", "account/profile", "product", "tag", "index", "cart/completed"];
const defaultVisitorRoles = ["anonymous", "guest", "product", "tag", "index", "cart/completed"];
const defaultOwnerRoles = [
  "owner",
  "admin",
  "createProduct",
  "dashboard",
  "shopSettings",
  "guest",
  "account/profile",
  "product",
  "tag",
  "index",
  "cart/completed"
];
const defaultShopManagerRoles = [
  "createProduct",
  "dashboard",
  "shopSettings",
  "guest",
  "account/profile",
  "product",
  "tag",
  "index",
  "cart/completed"
];

/**
 * @name createGroups
 * @method
 * @memberof Core
 * @summary creates groups for a shop
 * @param {Object} context App context
 * @param {String} shopId ID of shop to create the group for
 * @return {undefined}
 */
export default async function createGroups(context, shopId) {
  const {
    collections: {
      Groups,
      Shops
    }
  } = context;

  const roles = {
    "shop manager": defaultShopManagerRoles,
    "customer": defaultCustomerRoles,
    "guest": defaultVisitorRoles,
    "owner": defaultOwnerRoles
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
