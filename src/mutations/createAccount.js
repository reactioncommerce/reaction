import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import ensureAccountsManagerGroup from "../util/ensureAccountsManagerGroup.js";
import ensureSystemManagerGroup from "../util/ensureSystemManagerGroup.js";
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
 * @param {String} [input.shopId] - shop to create account for
 * @param {String} input.userId - userId account was created from
 * @return {Promise<Object>} with boolean of found new account === true || false
 */
export default async function createAccount(context, input) {
  inputSchema.validate(input);

  const {
    appEvents,
    collections: { Accounts, AccountInvites },
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

  await context.validatePermissions("reaction:legacy:accounts", "create", { shopId });

  // Create initial account object from user and profile
  const createdAt = new Date();
  const account = {
    _id: userId,
    acceptsMarketing: false,
    createdAt,
    emails,
    // Proper groups will be set with calls to `addAccountToGroup` below
    groups: [],
    name,
    profile,
    shopId,
    state: "new",
    updatedAt: createdAt,
    userId
  };

  let groups = new Set();
  let invites;

  // if this is the first user created overall, add them to the
  // `system-manager` and `accounts-manager` groups
  const anyAccount = await Accounts.findOne();
  if (!anyAccount) {
    const accountsManagerGroupId = await ensureAccountsManagerGroup(context);
    const systemManagerGroupId = await ensureSystemManagerGroup(context);
    groups.add(systemManagerGroupId);
    groups.add(accountsManagerGroupId);
  } else {
    // if this isn't the first account see if they were invited by another user
    // find all invites for this email address, for all shops, and add to all groups
    const emailAddresses = emails.map((emailRecord) => emailRecord.address.toLowerCase());
    invites = await AccountInvites.find({ email: { $in: emailAddresses } }).toArray();
    groups = invites.reduce((allGroupIds, invite) => {
      if (invite.groupIds) {
        invite.groupIds.forEach((groupId) => allGroupIds.add(groupId));
      }

      if (invite.groupId) {
        allGroupIds.add(invite.groupId);
      }

      return allGroupIds;
    }, new Set());
  }

  AccountSchema.validate(account);

  await Accounts.insertOne(account);

  if (groups.size > 0) {
    await context.mutations.updateGroupsForAccounts(context.getInternalContext(), {
      accountIds: [account._id],
      groupIds: Array.from(groups)
    });
  }

  // Delete any invites that are now finished
  if (invites) {
    await Promise.all(invites.map((invite) => {
      if (invite.shouldGetAdminUIAccess) {
        return context.mutations.grantAdminUIAccess(context, {
          accountId: account._id,
          shopId: invite.shopId
        });
      }

      return null;
    }));

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
