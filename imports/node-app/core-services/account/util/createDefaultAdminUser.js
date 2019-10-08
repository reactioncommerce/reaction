import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import { defaultOwnerRoles } from "./defaultRoles.js";
import createUser from "./createUser.js";

/**
 * @summary Creates the default admin user on startup
 * @param {Object} context App context
 * @returns {String|null} The new or existing "owner" user ID, or null if
 *   there is no primary shop.
 */
export default async function createDefaultAdminUser(context) {
  const { collections } = context;
  const { Shops, users } = collections;

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

  const shop = await Shops.findOne({ shopType: "primary" });

  if (!shop) {
    throw new Error("not-found", "Shop not found");
  }

  // defaults use either env or generated values
  const userInput = {
    email: REACTION_EMAIL || defaultEmail,
    name: REACTION_USER || defaultName,
    password: REACTION_AUTH || defaultPassword,
    shopId: shop._id,
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
        __global_roles__: defaultOwnerRoles // eslint-disable-line camelcase
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

  return userId;
}
