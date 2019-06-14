import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import { Meteor } from "meteor/meteor";
import addRolesToGroups from "./util/addRolesToGroups";
import createGroups from "./util/createGroups";
import { packageRolesAndGroups } from "./registration";

const defaultAdminRoles = [
  "account/profile",
  "admin",
  "cart/checkout",
  "cart/completed",
  "createProduct",
  "guest",
  "index",
  "owner",
  "product",
  "tag"
];

/**
 * @summary Creates the default admin user on startup
 * @param {Object} context App context
 * @returns {String|null} The new or existing "owner" user ID, or null if
 *   there is no primary shop.
 */
async function createDefaultAdminUser(context) {
  const { appEvents, collections, createUser } = context;
  const { Accounts, Groups, Shops, users } = collections;

  const primaryShop = await Shops.findOne({ shopType: "primary" });
  if (!primaryShop) return null;

  // Check whether a non-shop-specific "owner" user already exists
  const ownerUser = await users.findOne({ "roles.__global_roles__": "owner" });
  if (ownerUser) return ownerUser._id;

  const {
    REACTION_AUTH,
    REACTION_EMAIL,
    REACTION_SECURE_DEFAULT_ADMIN,
    REACTION_USER,
    REACTION_USER_NAME
  } = process.env;

  // If $REACTION_SECURE_DEFAULT_ADMIN is set to "true" on first run,
  // a random email/password will be generated instead of using the
  // default email and password (email: admin@localhost pw: r3@cti0n)
  // and the new admin user will need to verify their email to log in.
  // If a random email and password are generated, the console will be
  // the only place to retrieve them.
  // If the admin email/password is provided via environment or Meteor settings,
  // the $REACTION_SECURE_DEFAULT_ADMIN will only enforce the email validation part.
  const isSecureSetup = REACTION_SECURE_DEFAULT_ADMIN === "true";

  // generate default values to use if none are supplied
  const defaultEmail = isSecureSetup ? `${Random.id(8).toLowerCase()}@localhost` : "admin@localhost";
  const defaultPassword = isSecureSetup ? Random.secret(8) : "r3@cti0n";
  const defaultUsername = "admin";
  const defaultName = "Admin";

  if (REACTION_EMAIL && REACTION_AUTH) {
    Logger.info("Using environment variables to create admin user");
  } else {
    Logger.info("Using defaults to create admin user");
  }

  // defaults use either env or generated values
  const userInput = {
    email: REACTION_EMAIL || defaultEmail,
    name: REACTION_USER || defaultName,
    password: REACTION_AUTH || defaultPassword,
    username: REACTION_USER_NAME || defaultUsername
  };

  // Check whether a user who isn't the owner already has this email address
  const existingUser = await users.findOne({ "emails.address": userInput.email });
  if (existingUser) {
    throw new Error(`Can't create an admin user with email "${userInput.email}" because there is already a user with that address`);
  }

  const userId = await createUser(userInput);

  // Update the new user document with roles and other fields that Meteor's createUser
  // doesn't support.
  await users.updateOne({ _id: userId }, {
    $set: {
      name: userInput.name,
      roles: {
        [primaryShop._id]: defaultAdminRoles,
        __global_roles__: defaultAdminRoles // eslint-disable-line camelcase
      }
    }
  });

  // notify user that the default admin was created by
  // printing the account info to the console
  Logger.warn(`\n *********************************
      \n  IMPORTANT! DEFAULT ADMIN INFO
      \n  EMAIL/LOGIN: ${userInput.email}
      \n  PASSWORD: ${userInput.password}
      \n ********************************* \n\n`);

  // set the default shop email to the default admin email
  await Shops.updateOne({ _id: primaryShop._id }, {
    $addToSet: {
      emails: {
        address: userInput.email,
        verified: true
      }
    }
  });

  const group = await Groups.findOne({ slug: "owner", shopId: primaryShop._id });
  if (group) {
    await Accounts.updateOne({ userId }, { $set: { groups: [group._id] } });
  }

  // Automatically verify "localhost" email addresses
  let isVerified = false;
  if (userInput.email.indexOf("localhost") > -1) {
    await users.updateOne({
      "_id": userId,
      "emails.address": userInput.email
    }, {
      $set: {
        "emails.$.verified": true
      }
    });
    await Accounts.updateOne({
      userId,
      "emails.address": userInput.email
    }, {
      $set: {
        "emails.$.verified": true
      }
    });
    isVerified = true;
  }

  const account = await Accounts.findOne({ userId });
  await appEvents.emit("afterAccountCreate", {
    account,
    createdBy: null,
    isFirstOwnerAccount: true
  });

  if (!isVerified) {
    await appEvents.emit("afterAddUnverifiedEmailToUser", {
      email: userInput.email,
      userId
    });
  }

  return userId;
}

/**
 * @summary Add roles to groups as specified in the `addRolesToGroups` key
 *   of various plugin `registerPlugin` config. Either for one shop or all.
 * @param {Object} context App context
 * @param {String} shopId Shop ID
 * @return {undefined}
 */
async function addPluginRolesToGroups(context, shopId) {
  const promises = packageRolesAndGroups.map(({ groups, roles }) =>
    addRolesToGroups(context, { allShops: !shopId, groups, roles, shops: [shopId] }));

  await Promise.all(promises);
}

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

  // timing is important, packages are rqd for initial permissions configuration.
  if (!Meteor.isAppTest) {
    await createDefaultAdminUser(context);

    await addPluginRolesToGroups(context);
  }

  appEvents.on("afterShopCreate", async ({ createdBy: userId, shop }) => {
    const { _id: newShopId, shopType } = shop;

    // Create account groups for the new shop
    await createGroups(context, newShopId);

    // Find the "owner" group that was just created
    const ownerGroup = await Groups.findOne({ slug: "owner", shopId: newShopId });
    if (!ownerGroup) {
      throw new Error(`Can't find owner group for shop ID ${newShopId}`);
    }

    await addPluginRolesToGroups(context, newShopId);

    // If we just created the primary shop, the `createDefaultAdminUser` call above may have
    // failed to do anything. We run it again now. It won't create the user a second time
    // if it's already done.
    if (shopType === "primary") {
      await createDefaultAdminUser(context);
    }

    // If a user created the shop, give the user owner access to it
    if (userId) {
      // Add users to roles
      await users.updateOne({
        _id: userId
      }, {
        $addToSet: {
          [`roles.${newShopId}`]: {
            $each: ownerGroup.permissions
          }
        }
      });

      // Set the active shopId for this user
      await Accounts.updateOne({ userId }, {
        $set: {
          "profile.preferences.reaction.activeShopId": newShopId,
          "shopId": newShopId
        },
        $addToSet: {
          groups: ownerGroup._id
        }
      });

      const updatedAccount = await Accounts.findOne({ userId });
      Promise.await(appEvents.emit("afterAccountUpdate", {
        account: updatedAccount,
        updatedBy: userId,
        updatedFields: ["groups", "shopId"]
      }));
    }
  });
}
