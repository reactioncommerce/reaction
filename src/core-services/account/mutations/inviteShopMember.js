import _ from "lodash";
import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import createUser from "../util/createUser.js";
import getCurrentUserName from "../util/getCurrentUserName.js";
import getDataForEmail from "../util/getDataForEmail.js";

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
  const primaryShop = await Shops.findOne({ shopType: "primary" });
  if (!primaryShop) throw new ReactionError("not-found", "No primary shop found");

  let shop = primaryShop;
  if (primaryShop._id !== shopId) {
    shop = await Shops.findOne({ _id: shopId });
  }
  if (!shop) throw new ReactionError("not-found", "No shop found");

  const group = await Groups.findOne({ _id: groupId });
  if (!group) throw new ReactionError("not-found", "No group found");

  // we don't allow direct invitation of "owners", throw an error if that is the group
  if (group.slug === "owner") {
    throw new ReactionError("bad-request", "Cannot directly invite owner");
  }

  // check to see if invited user has an account
  const invitedUser = await users.findOne({ "emails.address": email });

  // if there is a userAccount, check to see if email has been verified
  const matchingEmail = invitedUser && invitedUser.emails && invitedUser.emails.find((accountEmail) => accountEmail.address === email);
  const isEmailVerified = matchingEmail && matchingEmail.verified;

  // set variables to pass to email templates
  const invitedByName = getCurrentUserName(userFromContext);
  let dataForEmail;
  let userId;
  let templateName;

  if (invitedUser) {
    userId = invitedUser._id;
  }

  // if the user already has an account, send in informative email instead of an invite email
  if (invitedUser && isEmailVerified) {
    // make sure user has an `Account` - this should always be the case
    const invitedAccount = await Accounts.findOne({ userId }, { projection: { _id: 1 } });
    if (!invitedAccount) throw new ReactionError("not-found", "User found but matching account not found");

    // do not send token, as no password reset is needed
    const url = context.getAbsoluteUrl();

    // use primaryShop's data (name, address etc) in email copy sent to new shop manager
    dataForEmail = await getDataForEmail(context, { shop: primaryShop, currentUserName: invitedByName, name, url });

    // Get email template and subject
    templateName = "accounts/inviteShopMember";
  } else {
    // There could be an existing user with an invite still pending (not activated).
    // We create a new account only if there's no pending invite.
    if (!invitedUser) {
      // The user does not already exist, we need to create a new account
      userId = await createUser({
        profile: { invited: true },
        email,
        name,
        shopId: shop._id
      });
    }

    const token = Random.id();

    // set token to be used for first login for the new account
    const tokenUpdate = {
      "services.password.reset": { token, email, when: new Date() },
      name
    };

    await users.updateOne({ _id: userId }, { $set: tokenUpdate }); // TODO: not sure if this is working

    // use primaryShop's data (name, address etc) in email copy sent to new shop manager
    dataForEmail = await getDataForEmail(context, { shop: primaryShop, currentUserName: invitedByName, name, token });

    // Get email template and subject
    templateName = "accounts/inviteNewShopMember";
  }

  // add new / existing user to invited group
  await context.mutations.addAccountToGroup(context, {
    accountId: userId,
    groupId
  });

  dataForEmail.groupName = _.startCase(group.name);

  // send invitation email from primary shop email
  await context.mutations.sendEmail(context, {
    data: dataForEmail,
    fromShop: primaryShop,
    templateName,
    to: email
  });

  return Accounts.findOne({ userId });
}
