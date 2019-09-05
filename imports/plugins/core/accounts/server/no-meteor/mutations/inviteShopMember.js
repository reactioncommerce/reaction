import _, { difference } from "lodash";
import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import getCurrentUserName from "/imports/plugins/core/accounts/server/no-meteor/util/getCurrentUserName";
import getDataForEmail from "/imports/plugins/core/accounts/server/util/getDataForEmail";

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
  const { collections, user: userFromContext, userHasPermission, userId: userIdFromContext } = context;
  const { Accounts, Groups, Shops, users } = collections;
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
  const primaryShop = Reaction.getPrimaryShop();
  if (!primaryShop) throw new ReactionError("not-found", "No primary shop found");

  let shop = primaryShop;
  if (primaryShop._id !== shopId) {
    shop = await Shops.findOne({ _id: shopId });
  }
  if (!shop) throw new ReactionError("not-found", "No shop found");

  const group = await Groups.findOne({ _id: groupId });
  if (!group) throw new ReactionError("not-found", "No gr found");

  // we don't allow direct invitation of "owners", throw an error if that is the group
  const ownerGroup = await Groups.findOne({ name: "owner" });
  if (group._id === ownerGroup._id) {
    throw new ReactionError("bad-request", "Cannot directly invite owner");
  }

  // An account can add another account to a group as long as the person adding
  // has all permissions granted by that group.
  // We can't use `userHasPermission` here because we want to make sure they
  // have ALL the permissions rather than ANY.
  // Accounts in the "Owner" group are able to add any user to any group,
  // regardless of other permissions.
  const contextUserAccount = await Accounts.findOne({ _id: userIdFromContext });
  const isOwnerAccount = !!ownerGroup && contextUserAccount.groups.includes(ownerGroup._id);

  const { permissions: groupPermissions = [] } = group;

  if (!context.isInternalCall && !isOwnerAccount && difference(groupPermissions, userFromContext.roles[shopId] || []).length > 0) {
    throw new ReactionError("access-denied", "Access Denied");
  }

  // check to see if invited user has an account
  const invitedUser = await users.findOne({ "emails.address": email });

  // if there is a userAccount, check to see if email has been verified
  const matchingEmail = invitedUser && invitedUser.emails && invitedUser.emails.find((accountEmail) => accountEmail.address === email);
  const isEmailVerified = matchingEmail && matchingEmail.verified;

  // set variables to pass to email templates
  const invitedByName = getCurrentUserName(contextUserAccount);
  let dataForEmail;
  let userId;
  let templateName;

  if (invitedUser) {
    userId = invitedUser._id;
  }

  // if the user already has an account, send in informative email instead of an invite email
  if (invitedUser && isEmailVerified) {
    // make sure user has an `Account` - this should always be the case
    const invitedAccount = await Accounts.findOne({ userId });
    if (!invitedAccount) throw new ReactionError("not-found", "User found but matching account not found");

    await context.mutations.addAccountToGroup({ ...context, isInternalCall: true }, {
      accountId: invitedAccount._id,
      groupId
    });

    // do not send token, as no password reset is needed
    const url = Reaction.absoluteUrl();

    // use primaryShop's data (name, address etc) in email copy sent to new shop manager
    dataForEmail = getDataForEmail(context, { shop: primaryShop, invitedByName, name, url });

    // Get email template and subject
    templateName = "accounts/inviteShopMember";
  } else {
    // There could be an existing user with an invite still pending (not activated).
    // We create a new account only if there's no pending invite.
    if (!invitedUser) {
      // The user does not already exist, we need to create a new account
      userId = await context.createUser({
        profile: { invited: true },
        email,
        name,
        groupId
      });
    }

    const token = Random.id();

    // set token to be used for first login for the new account
    const tokenUpdate = {
      "services.password.reset": { token, email, when: new Date() },
      name
    };

    await users.updateOne({ _id: userId }, { $set: tokenUpdate });

    // use primaryShop's data (name, address etc) in email copy sent to new shop manager
    dataForEmail = getDataForEmail(context, { shop: primaryShop, invitedByName, name, token });

    // Get email template and subject
    templateName = "accounts/inviteNewShopMember";
  }

  dataForEmail.groupName = _.startCase(group.name);

  // send invitation email from primary shop email
  await context.mutations.sendEmail(context, {
    data: dataForEmail,
    fromShop: primaryShop,
    templateName,
    to: email
  });

  return Accounts.findOne({ _id: userId });
}
