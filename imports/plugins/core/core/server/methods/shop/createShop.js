import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import { check, Match } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Roles } from "meteor/alanning:roles";
import { Accounts, Groups, Shops } from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";
import { Reaction } from "/lib/api";
import ReactionError from "@reactioncommerce/reaction-error";
import getSlug from "/imports/plugins/core/core/server/Reaction/getSlug";

/**
 * @name cloneShop
 * @summary Returns an existing shop object, with some values removed or changed such
 *   that it is suitable for inserting as a new shop.
 * @method
 * @param {Object} shop - the shop to clone
 * @param {Object} partialShopData - any properties you'd like to override
 * @return {Object|null} The cloned shop object or null if a shop with that ID can't be found
 * @private
 */
function cloneShop(shop, partialShopData = {}) {
  // if a name is not provided, generate a unique name
  if (!partialShopData || !partialShopData.name) {
    const count = Shops.find().count() || "";
    shop.name += count;
  }

  // merge in the partial shop data and some other current user attributes
  Object.assign(shop, partialShopData || {});

  const cleanShop = Schemas.Shop.clean(shop);

  // Never create a second primary shop
  if (!cleanShop.shopType || cleanShop.shopType === "primary") {
    cleanShop.shopType = "merchant";
  }

  // Clean up values that get automatically added
  delete cleanShop._id;
  delete cleanShop.createdAt;
  delete cleanShop.updatedAt;
  delete cleanShop.slug;
  // TODO audience permissions need to be consolidated into [object] and not [string]
  // permissions with [string] on layout ie. orders and checkout, cause the insert to fail
  delete cleanShop.layout;
  // delete brandAssets object from shop to prevent new shops from carrying over existing shop's
  // brand image
  delete cleanShop.brandAssets;

  return cleanShop;
}

/**
 * @name shop/createShop
 * @method
 * @memberof Shop/Methods
 * @param {String} shopAdminUserId - optionally create shop for provided userId
 * @param {Object} partialShopData - optionally provide a subset of shop data
 *                 which will be merged with properties from the primary shop
 *                 in order to create a document which meets the Shops schema
 *                 requirements.
 * @return {String} return shopId
 */
export default function createShop(shopAdminUserId, partialShopData) {
  check(shopAdminUserId, Match.Optional(String));
  // It is not necessary to test whether shopData is valid against the Shops
  // schema here, as shopData can be a subset of data. Later, shopData is
  // combined with a copy of the Primary Shop to fill in the gaps. It is at
  // that point that we validate/`check` that the combined object is valid
  // against the Shops schema.
  check(partialShopData, Match.Maybe(Object));

  // Get the current marketplace settings
  const marketplace = Reaction.getMarketplaceSettings();

  // check to see if the current user has owner permissions for the primary shop
  const hasPrimaryShopOwnerPermission = Reaction.hasPermission("owner", Meteor.userId(), Reaction.getPrimaryShopId());

  // only permit merchant signup if marketplace is enabled and allowMerchantSignup is enabled
  let allowMerchantShopCreation = false;
  if (marketplace && marketplace.enabled && marketplace.public && marketplace.public.allowMerchantSignup) {
    allowMerchantShopCreation = true;
  }

  // must have owner access to create new shops when marketplace is disabled
  if (!hasPrimaryShopOwnerPermission && !allowMerchantShopCreation) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  // Non-admin users may only create shops for themselves
  if (!hasPrimaryShopOwnerPermission && shopAdminUserId !== Meteor.userId()) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  // Anonymous users should never be permitted to create a shop
  if (!hasPrimaryShopOwnerPermission &&
      Reaction.hasPermission("anonymous", Meteor.userId(), Reaction.getPrimaryShopId())) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  const currentUser = Meteor.user();
  const currentAccount = Accounts.findOne({ _id: currentUser._id });
  if (!currentUser) {
    throw new ReactionError("server-error", "Unable to create shop without a user");
  }

  let shopUser = currentUser;
  let shopAccount = currentAccount;
  // TODO: Create a grantable permission for creating shops so we can decouple ownership from shop creation
  // Only marketplace owners can create shops for others
  if (hasPrimaryShopOwnerPermission) {
    shopUser = Meteor.users.findOne({ _id: shopAdminUserId }) || currentUser;
    shopAccount = Accounts.findOne({ _id: shopAdminUserId }) || currentAccount;
  }

  const primaryShopId = Reaction.getPrimaryShopId();

  // Disallow creation of multiple shops, even for marketplace owners
  if (shopAccount.shopId !== primaryShopId) {
    throw new ReactionError(
      "operation-not-permitted",
      "This user already has a shop. Each user may only have one shop."
    );
  }

  const shop = cloneShop(Reaction.getPrimaryShop(), partialShopData);

  shop.emails = shopUser.emails;
  shop.addressBook = shopAccount.addressBook;
  shop.slug = getSlug(shop.name);

  Shops.simpleSchema(shop).validate(shop);

  let newShopId;

  try {
    newShopId = Shops.insert(shop);
  } catch (error) {
    return Logger.error(error, "Failed to shop/createShop");
  }

  const newShop = Shops.findOne({ _id: newShopId });

  // we should have created new shop, or errored
  Logger.info("Created shop: ", newShopId);

  // update user
  Reaction.insertPackagesForShop(newShopId);
  Reaction.createGroups({ shopId: newShopId });
  const ownerGroup = Groups.findOne({ slug: "owner", shopId: newShopId });
  Roles.addUsersToRoles([currentUser, shopUser._id], ownerGroup.permissions, newShopId);
  // Set the active shopId for this user
  Reaction.setUserPreferences("reaction", "activeShopId", newShopId, shopUser._id);
  Accounts.update({ _id: shopUser._id }, {
    $set: {
      shopId: newShopId
    },
    $addToSet: {
      groups: ownerGroup._id
    }
  });
  Hooks.Events.run("afterAccountsUpdate", currentUser._id, {
    accountId: shopUser._id,
    updatedFields: ["groups"]
  });
  // Add this shop to the merchant
  Shops.update({ _id: primaryShopId }, {
    $addToSet: {
      merchantShops: {
        _id: newShopId,
        slug: newShop.slug,
        name: newShop.name
      }
    }
  });

  // Set active shop to new shop.
  return { shopId: newShopId };
}
