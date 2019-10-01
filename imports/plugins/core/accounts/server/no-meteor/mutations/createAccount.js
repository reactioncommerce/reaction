import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import sendWelcomeEmail from "../util/sendWelcomeEmail";

const inputSchema = new SimpleSchema({
  bio: {
    type: String,
    optional: true
  },
  name: {
    type: String,
    optional: true
  },
  picture: {
    type: String,
    optional: true
  },
  shopId: String,
  username: {
    type: String,
    optional: true
  },
  user: {
    type: Object,
    blackbox: true
  },
  verificationToken: {
    type: String,
    optional: true
  }
});

/**
 * @name accounts/createAccount
 * @memberof Mutations/Accounts
 * @summary Create a new account
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Necessary input for mutation. See SimpleSchema.
 * @param {String} [input.bio] - bio to display on profile
 * @param {String} [input.name] - name to display on profile
 * @param {String} [input.picture] - picture to display on profile
 * @param {String} input.shopId - shop to create account for
 * @param {String} [input.username] - username to display on profile
 * @param {String} input.user - user to create account from
 * @param {String} [input.verificationToken] - token for account verification
 * @return {Promise<Object>} with boolean of found new account === true || false
 */
export default async function createAccount(context, input) {
  inputSchema.validate(input);
  const { appEvents, collections, userHasPermission } = context;
  const { Accounts, Groups } = collections;
  const {
    bio,
    name,
    picture,
    shopId,
    username,
    user,
    verificationToken
  } = input;

  if (!context.isInternalCall && !userHasPermission(["reaction-accounts", "account/invite"], shopId)) {
    throw new ReactionError("access-denied", "Access denied");
  }

  const profile = { bio, name, picture, username };

  // Create initial account object from user and profile
  const account = Object.assign({ shopId }, user, profile);
  account.userId = user._id;

  // if we don't have user.services we're an anonymous user
  if (!user.services) {
    // TODO: look into getting rid of this guest account
    const group = await Groups.findOne({ slug: "guest", shopId });
    if (group) {
      account.groups = [group._id];
    }
  } else {
    const group = await Groups.findOne({ slug: "customer", shopId });
    if (group) {
      account.groups = [group._id];
    }
  }

  // remove `services` from the account before creating
  delete account.services;

  await Accounts.insertOne(account);

  if (verificationToken) {
    await sendWelcomeEmail(context, { shopId, token: verificationToken, userId: account.userId });
  }

  await appEvents.emit("afterAccountCreate", {
    account,
    createdBy: user._id
  });

  return account;
}
