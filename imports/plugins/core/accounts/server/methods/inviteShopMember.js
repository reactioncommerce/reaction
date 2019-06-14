import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import { Meteor } from "meteor/meteor";
import { Accounts as MeteorAccounts } from "meteor/accounts-base";
import { check } from "meteor/check";
import { SSR } from "meteor/meteorhacks:ssr";
import { Accounts, Groups, Shops } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";
import getCurrentUserName from "../no-meteor/util/getCurrentUserName";
import getDataForEmail from "../util/getDataForEmail";

/**
 * @name accounts/inviteShopMember
 * @summary Invite new admin users (not consumers) to secure access in the dashboard to permissions
 * as specified in packages/roles
 * @memberof Accounts/Methods
 * @method
 * @param {Object} options -
 * @param {String} options.shopId - shop to invite user
 * @param {String} options.groupId - groupId to invite user
 * @param {String} options.email - email of invitee
 * @param {String} options.name - name of invitee
 * @returns {Boolean} returns true
 */
export default function inviteShopMember(options) {
  const { shopId, email, name, groupId } = options;
  check(options, Object);
  check(shopId, String);
  check(email, String);
  check(name, String);
  check(groupId, String);

  // given that we `export` this function, there is an expectation that it can
  // be imported and used elsewhere in the code. the use of `this` in this
  // method requires that the context be Meteor, and further, `this.unblock()`
  // assumes that this is being run as a Meteor method. Consider using a small
  // function in the Meteor.method section below to call unblock, and pass any
  // Meteor-defined data (e.g., userId) as a parameter to allow for this method
  // to be reused.
  this.unblock();

  const shop = Shops.findOne(shopId);
  const primaryShop = Reaction.getPrimaryShop();

  if (!shop) {
    const msg = `accounts/inviteShopMember - Shop ${shopId} not found`;
    Logger.error(msg);
    throw new Meteor.Error("not-found", msg);
  }

  if (!Reaction.hasPermission("reaction-accounts", this.userId, shopId)) {
    Logger.error(`User ${this.userId} does not have reaction-accounts permissions`);
    throw new ReactionError("access-denied", "Access denied");
  }

  const group = Groups.findOne({ _id: groupId }) || {};

  // check to ensure that user has roles required to perform the invitation
  if (!Reaction.canInviteToGroup({ group, user: Meteor.user() })) {
    throw new ReactionError("access-denied", "Cannot invite to group");
  }

  if (group.slug === "owner") {
    throw new ReactionError("bad-request", "Cannot directly invite owner");
  }

  const currentUser = Meteor.user();
  const currentUserName = getCurrentUserName(currentUser);
  const emailLogo = Reaction.Email.getShopLogo(primaryShop);
  const user = Meteor.users.findOne({ "emails.address": email });
  const token = Random.id();
  let dataForEmail;
  let userId;
  let tpl;
  let subject;

  // If the user already has an account, send informative email, not "invite" email
  if (user) {
    // The user already exists, we promote the account, rather than creating a new one
    userId = user._id;
    Meteor.call("group/addUser", userId, groupId);

    // do not send token, as no password reset is needed
    const url = Reaction.absoluteUrl();

    // use primaryShop's data (name, address etc) in email copy sent to new shop manager
    dataForEmail = getDataForEmail({ shop: primaryShop, currentUserName, name, emailLogo, url });

    // Get email template and subject
    tpl = "accounts/inviteShopMember";
    subject = "accounts/inviteShopMember/subject";
  } else {
    // The user does not already exist, we need to create a new account
    userId = MeteorAccounts.createUser({
      profile: { invited: true },
      email,
      name,
      groupId
    });
    // set token to be used for first login for the new account
    const tokenUpdate = {
      "services.password.reset": { token, email, when: new Date() },
      name
    };
    Meteor.users.update(userId, { $set: tokenUpdate });

    // use primaryShop's data (name, address etc) in email copy sent to new shop manager
    dataForEmail = getDataForEmail({ shop: primaryShop, currentUserName, name, token, emailLogo });

    // Get email template and subject
    tpl = "accounts/inviteNewShopMember";
    subject = "accounts/inviteNewShopMember/subject";
  }

  dataForEmail.groupName = _.startCase(group.name);

  const account = Accounts.findOne({ userId });
  const language = account && account.profile && account.profile.language;

  // Compile Email with SSR
  SSR.compileTemplate(tpl, Reaction.Email.getTemplate(tpl, language));
  SSR.compileTemplate(subject, Reaction.Email.getSubject(tpl, language));

  // send invitation email from primary shop email
  Reaction.Email.send({
    to: email,
    from: `${dataForEmail.primaryShop.name} <${dataForEmail.primaryShop.emails[0].address}>`,
    subject: SSR.render(subject, dataForEmail),
    html: SSR.render(tpl, dataForEmail)
  });

  return account;
}
