import _ from "lodash";
import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import config from "../config.js";
import getCurrentUserName from "../util/getCurrentUserName.js";

const { REACTION_ADMIN_PUBLIC_ACCOUNT_REGISTRATION_URL } = config;

const inputSchema = new SimpleSchema({
  "email": String,
  "groupIds": Array,
  "groupIds.$": String,
  "name": String,
  "shopId": String,
  "shouldGetAdminUIAccess": {
    type: Boolean,
    optional: true
  }
});

/**
 * @name accounts/inviteShopMember
 * @memberof Mutations/Accounts
 * @summary Invite new admin users (not consumers) to secure access in the dashboard to permissions
 * as specified in packages/roles
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Necessary input for mutation. See SimpleSchema.
 * @param {String} input.shopId - shop to invite user
 * @param {String} input.groupIds - groupIds to invite user
 * @param {String} input.email - email of invitee
 * @param {String} input.name - name of invitee
 * @param {String} [input.shouldGetAdminUIAccess] - Whether the new user should get admin UI access for the shop
 * @return {Promise<Object>} with boolean of found new account === true || false
 */
export default async function inviteShopMember(context, input) {
  inputSchema.validate(input);
  const { collections, user: userFromContext } = context;
  const { Accounts, AccountInvites, Groups, Shops } = collections;
  const {
    email,
    groupIds,
    name,
    shopId,
    shouldGetAdminUIAccess = false
  } = input;

  await context.validatePermissions("reaction:legacy:accounts", "invite:group", { shopId });

  // we always use primary shop data, so retrieve this shop first with `Reaction` helper,
  // and only query the `Shops` collection if shopId !== primaryShop._id
  const shop = await Shops.findOne({ _id: shopId });
  if (!shop) throw new ReactionError("not-found", "No shop found");

  const groups = await Groups.find({
    _id: {
      $in: groupIds
    }
  }).toArray();

  if (groups.length === 0) {
    throw new ReactionError("not-found", "No groups matching the provided IDs were found");
  }

  if (groups.length !== groupIds.length) {
    throw new ReactionError("not-found", `Could not find ${groupIds.length - groups.length} of ${groupIds.length} groups provided`);
  }

  const lowercaseEmail = email.toLowerCase();

  // check to see if invited email has an account
  const invitedAccount = await Accounts.findOne({ "emails.address": lowercaseEmail }, { projection: { _id: 1 } });

  if (invitedAccount) {
    // Set the account's permission group for this shop
    await context.mutations.updateGroupsForAccounts(context, {
      accountIds: [invitedAccount._id],
      groupIds
    });

    return Accounts.findOne({ _id: invitedAccount._id });
  }

  const groupShopIds = groups.reduce((allShopIds, group) => {
    if (!allShopIds.includes(group.shopId)) {
      allShopIds.push(group.shopId);
    }

    return allShopIds;
  }, []);

  // This check is part of `updateGroupsForAccounts` mutation for existing users. For new users,
  // we do it here before creating an invite record and sending the invite email.
  await Promise.all(groupShopIds.map((groupShopId) => context.validatePermissions("reaction:legacy:groups", "manage:accounts", { shopId: groupShopId })));

  // Create an AccountInvites document. If a person eventually creates an account with this email address,
  // it will be automatically added to this group instead of the default group for this shop.
  await AccountInvites.updateOne({
    email: lowercaseEmail,
    shopId
  }, {
    $set: {
      groupIds,
      invitedByUserId: userFromContext._id,
      shouldGetAdminUIAccess
    },
    $setOnInsert: {
      _id: Random.id()
    }
  }, {
    upsert: true
  });

  // Now send them an invitation email
  const dataForEmail = {
    contactEmail: _.get(shop, "emails[0].address"),
    copyrightDate: new Date().getFullYear(),
    groupName: _.startCase(groups[0].name),
    groupNames: groups.map((group) => group.name),
    hasMultipleGroups: groups.length > 1,
    legalName: _.get(shop, "addressBook[0].company"),
    physicalAddress: {
      address: `${_.get(shop, "addressBook[0].address1")} ${_.get(shop, "addressBook[0].address2")}`,
      city: _.get(shop, "addressBook[0].city"),
      region: _.get(shop, "addressBook[0].region"),
      postal: _.get(shop, "addressBook[0].postal")
    },
    shopName: shop.name,
    currentUserName: getCurrentUserName(userFromContext),
    invitedUserName: name,
    url: REACTION_ADMIN_PUBLIC_ACCOUNT_REGISTRATION_URL
  };

  await context.mutations.sendEmail(context, {
    data: dataForEmail,
    fromShop: shop,
    templateName: "accounts/inviteNewShopMember",
    to: lowercaseEmail
  });

  return null;
}
