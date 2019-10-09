import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import sendWelcomeEmail from "../util/sendWelcomeEmail.js";

const inputSchema = new SimpleSchema({
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
  "profile": {
    type: Object,
    blackbox: true,
    optional: true
  },
  "shopId": String,
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
 * @param {Array} [input.emails] - email array to attach to this user
 * @param {String} [input.name] - name to display on profile
 * @param {String} [input.profile] - Profile object
 * @param {String} input.shopId - shop to create account for
 * @param {String} input.userId - userId account was created from
 * @param {String} [input.verificationToken] - token for account verification
 * @return {Promise<Object>} with boolean of found new account === true || false
 */
export default async function createAccount(context, input) {
  inputSchema.validate(input);
  const { appEvents, collections, userId: authUserId, userHasPermission } = context;
  const { Accounts, Groups } = collections;
  const {
    emails,
    name,
    profile,
    shopId,
    userId,
    verificationToken
  } = input;

  if (!context.isInternalCall && !userHasPermission(["reaction-accounts", "account/invite"], shopId)) {
    throw new ReactionError("access-denied", "Access denied");
  }

  // Create initial account object from user and profile
  const account = {
    _id: userId,
    acceptsMarketing: false,
    createdAt: new Date(),
    emails,
    name,
    profile,
    shopId,
    state: "new",
    updatedAt: new Date(),
    userId
  };

  const group = await Groups.findOne({ slug: "customer", shopId });
  account.groups = group ? [group._id] : [];

  await Accounts.insertOne(account);

  if (verificationToken) {
    await sendWelcomeEmail(context, { shopId, token: verificationToken, userId });
  }

  await appEvents.emit("afterAccountCreate", {
    account,
    createdBy: authUserId
  });

  return account;
}
