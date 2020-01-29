import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
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

  let groups = [];

  // if this is the first user created overall, add them to the
  // `system-manager` and `accounts-manager` groups
  const appAccounts = await Accounts.find({}).toArray();
  if (appAccounts.length === 0) {
    // get IDs of `system-manager` and `account-manager` groups
    const systemManagerGroup = await Groups.findOne({ slug: "system-manager" });
    let systemManagerGroupId = (systemManagerGroup && systemManagerGroup._id) || null;
    // if system-manager group doesn't exist, create it now
    if (!systemManagerGroup) {
      systemManagerGroupId = Random.id();
      await Groups.insertOne({
        _id: systemManagerGroupId,
        name: "system manager",
        slug: "system-manager",
        permissions: [
          "reaction:legacy:accounts/invite:group",
          "reaction:legacy:accounts/add:emails",
          "reaction:legacy:accounts/add:address-books",
          "reaction:legacy:accounts/create",
          "reaction:legacy:accounts/delete:emails",
          "reaction:legacy:accounts/invite:group",
          "reaction:legacy:accounts/read",
          "reaction:legacy:accounts/remove:address-books",
          "reaction:legacy:accounts/update:address-books",
          "reaction:legacy:accounts/update:currency",
          "reaction:legacy:accounts/update:language",
          "reaction:legacy:accounts/read",
          "reaction:legacy:accounts/read:admin-accounts",
          "reaction:legacy:accounts/create",
          "reaction:legacy:accounts/read",
          "reaction:legacy:accounts/read:admin-accounts",
          "reaction:legacy:shops/create"
        ],
        shopId: null
      });
    }
    groups.push(systemManagerGroupId);

    const accountsManagerGroup = await Groups.findOne({ slug: "system-manager" });
    let accountsManagerGroupId = (accountsManagerGroup && accountsManagerGroup._id) || null;
    // if accounts-manager group doesn't exist, create it now
    if (!accountsManagerGroup) {
      accountsManagerGroupId = Random.id();
      await Groups.insertOne({
        _id: accountsManagerGroupId,
        name: "system manager",
        slug: "system-manager",
        permissions: [
          "reaction:legacy:accounts/invite:group",
          "reaction:legacy:accounts/add:emails",
          "reaction:legacy:accounts/add:address-books",
          "reaction:legacy:accounts/create",
          "reaction:legacy:accounts/delete:emails",
          "reaction:legacy:accounts/invite:group",
          "reaction:legacy:accounts/read",
          "reaction:legacy:accounts/remove:address-books",
          "reaction:legacy:accounts/update:address-books",
          "reaction:legacy:accounts/update:currency",
          "reaction:legacy:accounts/update:language",
          "reaction:legacy:accounts/read",
          "reaction:legacy:accounts/read:admin-accounts",
          "reaction:legacy:accounts/create",
          "reaction:legacy:accounts/read",
          "reaction:legacy:accounts/read:admin-accounts",
          "reaction:legacy:shops/create"
        ],
        shopId: null
      });
    }
    groups.push(accountsManagerGroupId);
  }

  // if this isn't the first account, check to see if this user was invited to a group
  let invites;
  if (appAccounts) {
    // find all invites for this email address, for all shops, and add to all groups
    const emailAddresses = emails.map((emailRecord) => emailRecord.address.toLowerCase());
    invites = await AccountInvites.find({ email: { $in: emailAddresses } }).toArray();
    groups = invites.map((invite) => invite.groupId);
  }

  AccountSchema.validate(account);

  await Accounts.insertOne(account);

  try {
    await Promise.all(groups.map((groupId) => (
      context.mutations.addAccountToGroup(context.getInternalContext(), {
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
