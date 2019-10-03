import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import sendWelcomeEmail from "../util/sendWelcomeEmail";

const inputSchema = new SimpleSchema({
  "bio": {
    type: String,
    optional: true
  },
  "emails": Array,
  "emails.$": {
    type: Object,
    blackbox: true,
    optional: true
  },
  "name": {
    type: String,
    optional: true
  },
  "picture": {
    type: String,
    optional: true
  },
  "shopId": String,
  "username": {
    type: String,
    optional: true
  },
  "userId": String,
  "verificationToken": {
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
 * @param {Array} [input.emails] - email array to attach to this user
 * @param {String} [input.name] - name to display on profile
 * @param {String} [input.picture] - picture to display on profile
 * @param {String} input.shopId - shop to create account for
 * @param {String} [input.username] - username to display on profile
 * @param {String} input.userId - userId account was created from
 * @param {String} [input.verificationToken] - token for account verification
 * @return {Promise<Object>} with boolean of found new account === true || false
 */
export default async function createAccount(context, input) {
  inputSchema.validate(input);
  const { appEvents, collections, userHasPermission } = context;
  const { Accounts, Groups } = collections;
  const {
    bio,
    emails,
    name,
    picture,
    shopId,
    username,
    userId,
    verificationToken
  } = input;

  if (!context.isInternalCall && !userHasPermission(["reaction-accounts", "account/invite"], shopId)) {
    throw new ReactionError("access-denied", "Access denied");
  }

  const profile = { bio, emails, name, picture, userId, username };

  // Create initial account object from user and profile
  const account = Object.assign({ shopId }, profile);
  account._id = userId || Random.id();
  account.userId = userId;

  const group = await Groups.findOne({ slug: "customer", shopId });
  if (group) {
    account.groups = [group._id];
  }

  await Accounts.insertOne(account);

  if (verificationToken) {
    await sendWelcomeEmail(context, { shopId, token: verificationToken, userId: account.userId });
  }

  await appEvents.emit("afterAccountCreate", {
    account,
    createdBy: userId
  });

  return account;
}
