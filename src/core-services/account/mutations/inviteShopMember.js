import _ from "lodash";
import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import config from "../config.js";
import getCurrentUserName from "../util/getCurrentUserName.js";

const { REACTION_ADMIN_PUBLIC_ACCOUNT_REGISTRATION_URL } = config;

const inputSchema = new SimpleSchema({
  email: String,
  groupId: String,
  name: String,
  shopId: String
});

/**
 * @name accounts/inviteShopMember
 * @memberof Mutations/Accounts
 * @summary Invite new admin users (not consumers) to secure access in the dashboard to permissions
 * as specified in packages/roles
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Necessary input for mutation. See SimpleSchema.
 * @param {String} input.shopId - shop to invite user
 * @param {String} input.groupId - groupId to invite user
 * @param {String} input.email - email of invitee
 * @param {String} input.name - name of invitee
 * @return {Promise<Object>} with boolean of found new account === true || false
 */
export default async function inviteShopMember(context, input) {
  inputSchema.validate(input);
  const { collections, user: userFromContext, userHasPermission } = context;
  const { Accounts, AccountInvites, Groups, Shops, users } = collections;
  const {
    email,
    groupId,
    name,
    shopId
  } = input;

  if (!userHasPermission(["reaction-accounts", "account/invite"], shopId)) {
    throw new ReactionError("access-denied", "Access denied");
  }

  // we always use primary shop data, so retrieve this shop first with `Reaction` helper,
  // and only query the `Shops` collection if shopId !== primaryShop._id
  const shop = await Shops.findOne({ _id: shopId });
  if (!shop) throw new ReactionError("not-found", "No shop found");

  const group = await Groups.findOne({ _id: groupId }, { projection: { name: 1, slug: 1 } });
  if (!group) throw new ReactionError("not-found", "No group found");

  // we don't allow direct invitation of "owners", throw an error if that is the group
  if (group.slug === "owner") {
    throw new ReactionError("bad-request", "Cannot directly invite owner");
  }

  // check to see if invited user has an account
  const invitedUser = await users.findOne({ "emails.address": email });

  if (invitedUser) {
    // make sure user has an account
    const invitedAccount = await Accounts.findOne({ userId: invitedUser._id }, { projection: { _id: 1 } });
    if (!invitedAccount) throw new ReactionError("not-found", "User found but matching account not found");

    // Set the account's permission group for this shop
    await context.mutations.addAccountToGroup(context, {
      accountId: invitedAccount._id,
      groupId
    });

    return Accounts.findOne({ _id: invitedAccount._id });
  }

  // Create an AccountInvites document. If a person eventually creates an account with this email address,
  // it will be automatically added to this group instead of the default group for this shop.
  await AccountInvites.updateOne({
    email,
    shopId
  }, {
    $set: {
      groupId,
      invitedByUserId: userFromContext._id
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
    groupName: _.startCase(group.name),
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
    to: email
  });

  return null;
}
