import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import sendWelcomeEmail from "../util/sendWelcomeEmail.js";

const inputSchema = new SimpleSchema({
  "emails": Array,
  "emails.$": {
    type: Object,
    blackbox: true
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
  "shopId": {
    type: String,
    optional: true
  },
  "userId": String
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
 * @return {Promise<Object>} with boolean of found new account === true || false
 */
export default async function createAccount(context, input) {
  inputSchema.validate(input);

  const {
    appEvents,
    checkPermissions,
    checkPermissionsLegacy,
    collections: { Accounts, Groups },
    simpleSchemas: {
      Account: AccountSchema
    },
    userId: authUserId,
    userHasPermissionLegacy
  } = context;

  const {
    emails,
    name = null,
    profile,
    shopId = null,
    userId
  } = input;

  if (shopId && !context.isInternalCall) {
    await checkPermissionsLegacy(["reaction-accounts", "account/invite"], shopId);
    await checkPermissions("reaction:account", "create", { shopId });
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

  let groupSlug = "customer"; // Default is to put new accounts into the "customer" permission group

  // The identity provider service gives the first created user the global "owner" role. When we
  // create an account for this user, they should be assigned to the "owner" group.
  // TODO: pod-auth - How do we go about these where we check for a group?
  if (authUserId === userId && userHasPermissionLegacy(["owner"])) groupSlug = "owner";

  const group = await Groups.findOne({ slug: groupSlug, shopId });
  account.groups = group ? [group._id] : [];

  AccountSchema.validate(account);

  await Accounts.insertOne(account);

  try {
    await sendWelcomeEmail(context, { accountId: account._id });
  } catch (error) {
    Logger.error(error, "Error sending welcome email but account was created");
  }

  await appEvents.emit("afterAccountCreate", {
    account,
    createdBy: authUserId
  });

  return account;
}
