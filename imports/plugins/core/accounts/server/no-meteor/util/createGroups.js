import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";

const defaultCustomerRoles = ["guest", "account/profile", "product", "tag", "index", "cart/completed"];
const defaultVisitorRoles = ["anonymous", "guest", "product", "tag", "index", "cart/completed"];

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

  const roles = await getDefaultGroupRoles(context);

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

/**
 * @method getDefaultGroupRoles
 * @private
 * @method
 * @memberof Core
 * @summary Generates default groups: Get all defined roles from the DB except "anonymous"
 * because that gets removed from a user on register if it's not removed,
 * it causes mismatch between roles in user (i.e Meteor.user().roles[shopId]) vs that in
 * the user's group
 * @param {Object} context App context
 * @return {Object} object key-value pair containing the default groups and roles for the groups
 */
async function getDefaultGroupRoles(context) {
  const allRoles = await context.collections.roles.find({}).toArray();
  let ownerRoles = allRoles.map((role) => role.name)
    .filter((role) => role !== "anonymous"); // see comment above

  // Join all other roles with package roles for owner. Owner should have all roles
  // this is needed because of default roles defined in the app that are not in Roles.getAllRoles
  ownerRoles = ownerRoles.concat(defaultCustomerRoles);
  ownerRoles = _.uniq(ownerRoles);

  // we're making a Shop Manager default group that have all roles except the owner role
  const shopManagerRoles = ownerRoles.filter((role) => role !== "owner" && role !== "admin");
  shopManagerRoles.push("shopSettings");

  const roles = {
    "shop manager": shopManagerRoles,
    "customer": defaultCustomerRoles,
    "guest": defaultVisitorRoles,
    "owner": ownerRoles
  };

  return roles;
}
