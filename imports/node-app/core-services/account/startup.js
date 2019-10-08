import { Meteor } from "meteor/meteor";
import addPluginRolesToGroups from "./util/addPluginRolesToGroups.js";
import createDefaultAdminUser from "./util/createDefaultAdminUser.js";
import createGroups from "./util/createGroups.js";
import ensureRoles from "./util/ensureRoles.js";
import {
  defaultCustomerRoles,
  defaultOwnerRoles,
  defaultShopManagerRoles,
  defaultVisitorRoles
} from "./util/defaultRoles.js";
import sendVerificationEmail from "./util/sendVerificationEmail.js";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default async function startup(context) {
  const {
    appEvents,
    collections: {
      Accounts,
      Groups,
      users
    }
  } = context;

  appEvents.on("afterAddUnverifiedEmailToUser", ({ email, shopId, userId }) => {
    sendVerificationEmail(context, { email, shopId, userId });
  });

  appEvents.on("afterShopCreate", async (payload) => {
    const { shop, shopAdminUserId } = payload;
    let { createdBy: userId } = payload;
    const { _id: newShopId, shopType } = shop;

    // Create account groups for the new shop
    await createGroups(context, newShopId);

    // Find the "owner" group that was just created
    const ownerGroup = await Groups.findOne({ slug: "owner", shopId: newShopId });
    if (!ownerGroup) {
      throw new Error(`Can't find owner group for shop ID ${newShopId}`);
    }

    await addPluginRolesToGroups(context, newShopId);

    // If we just created the primary shop and there is no userId, this is the
    // sample data import that happens on startup. Give the global owner user
    // access to the primary shop.
    if (!userId && shopType === "primary") {
      let ownerUser = await users.findOne({ "roles.__global_roles__": "owner" });
      if (!ownerUser) {
        const defaultAdminUserId = await createDefaultAdminUser(context);
        ownerUser = await users.findOne({ _id: defaultAdminUserId });

        if (!ownerUser) {
          throw new Error("Primary shop created, but no global owner user exists. This may be a timing issue. Try restarting the app.");
        }
      }
      userId = ownerUser._id;
    }

    // If a user created the shop, give the user owner access to it
    if (shopAdminUserId) {
      // Add users to roles
      await users.updateOne({
        _id: shopAdminUserId
      }, {
        $addToSet: {
          [`roles.${newShopId}`]: {
            $each: ownerGroup.permissions
          }
        }
      });

      // Set the active shopId for this user
      await Accounts.updateOne({ shopAdminUserId }, {
        $set: {
          "profile.preferences.reaction.activeShopId": newShopId,
          "shopId": newShopId
        },
        $addToSet: {
          groups: ownerGroup._id
        }
      });

      const updatedAccount = await Accounts.findOne({ shopAdminUserId });
      Promise.await(appEvents.emit("afterAccountUpdate", {
        account: updatedAccount,
        updatedBy: userId,
        updatedFields: ["groups", "shopId"]
      }));
    }
  });

  // Add missing roles to `roles` collection if needed
  await ensureRoles(context, defaultCustomerRoles);
  await ensureRoles(context, defaultOwnerRoles);
  await ensureRoles(context, defaultShopManagerRoles);
  await ensureRoles(context, defaultVisitorRoles);

  // timing is important, packages are rqd for initial permissions configuration.
  if (!Meteor.isAppTest) {
    await addPluginRolesToGroups(context);
  }
}
