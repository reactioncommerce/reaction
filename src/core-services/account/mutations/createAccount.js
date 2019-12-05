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
    collections: { Accounts, AccountInvites, Groups },
    simpleSchemas: {
      Account: AccountSchema
    },
    userId: authUserId
  } = context;

  const {
    emails,
    name = null,
    profile,
    shopId = null,
    userId
  } = input;

  if (!context.isInternalCall) {
    await context.validatePermissions("reaction:accounts", "create", { shopId, legacyRoles: ["reaction-accounts"] });
  }

  // Create initial account object from user and profile
  const account = {
    _id: userId,
    acceptsMarketing: false,
    createdAt: new Date(),
    emails,
    // Proper groups will be set with calls to `addAccountToGroup` below
    groups: [],
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
  let groups;
  let invites;
  if (authUserId === userId && context.userHasPermission("reaction:shops", "owner", { shopId, legacyRoles: ["owner"] })) { // TODO(pod-auth): update this permissions check
    groupSlug = "owner";
  } else {
    const emailAddresses = emails.map((emailRecord) => emailRecord.address);
    // Find all invites for all shops and add to all groups
    invites = await AccountInvites.find({ email: { $in: emailAddresses } }).toArray();
    groups = invites.map((invite) => invite.groupId);
  }

  if (!groups) {
    if (shopId) {
      const group = await Groups.findOne({ slug: groupSlug, shopId });
      groups = group ? [group._id] : [];
    } else {
      groups = [];
    }
  }

  AccountSchema.validate(account);

  await Accounts.insertOne(account);

  // Add all group permissions to the user roles. Because of the complexity of this
  // and potential security concerns if done incorrectly, it's best to use the mutation.
  try {
    await Promise.all(groups.map((groupId) => (
      context.mutations.addAccountToGroup({
        ...context,
        isInternalCall: true
      }, {
        accountId: account._id,
        groupId
      })
    )));
  } catch (error) {
    Logger.error(error, `Error adding account ${account._id} to group upon account creation`);
  }

  // Delete any invites that are now finished
  if (invites) {
    await AccountInvites.deleteMany({
      _id: { $in: invites.map((invite) => invite._id) }
    });
  }

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
