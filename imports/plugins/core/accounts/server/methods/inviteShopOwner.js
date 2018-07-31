import _ from "lodash";
import Random from "@reactioncommerce/random";
import { Meteor } from "meteor/meteor";
import { Accounts as MeteorAccounts } from "meteor/accounts-base";
import { check, Match } from "meteor/check";
import { SSR } from "meteor/meteorhacks:ssr";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "/imports/plugins/core/graphql/server/no-meteor/ReactionError";
import getCurrentUserName from "../no-meteor/util/getCurrentUserName";
import getDataForEmail from "../util/getDataForEmail";

/**
 * @name accounts/inviteShopOwner
 * @summary Invite a new user as owner of a new shop
 * @memberof Accounts/Methods
 * @method
 * @param {Object} options -
 * @param {String} options.email - email of invitee
 * @param {String} options.name - name of invitee
 * @param {Object} shopData - (optional) data used to create the new shop
 * @returns {Boolean} returns true
 */
export default function inviteShopOwner(options, shopData) {
  check(options, Object);
  check(options.email, String);
  check(options.name, String);
  check(shopData, Match.Maybe(Object));
  const { name, email } = options;

  // given that we `export` this function, there is an expectation that it can
  // be imported and used elsewhere in the code. the use of `this` in this
  // method requires that the context be Meteor. Consider using a small
  // function in the Meteor.method section below to pass any  Meteor-defined
  // data (e.g., userId) as a parameter to allow for this method to be reused.
  if (!Reaction.hasPermission("admin", this.userId, Reaction.getPrimaryShopId())) {
    throw new ReactionError("access-denied", "Access denied");
  }
  const user = Meteor.users.findOne({ "emails.address": email });
  let userId;
  if (user) {
    // TODO: Verify email address
    userId = user._id;
  } else {
    userId = MeteorAccounts.createUser({
      email,
      name,
      profile: { invited: true }
    });
  }

  Meteor.call("shop/createShop", userId, shopData);
  const primaryShop = Reaction.getPrimaryShop();

  // Compile Email with SSR
  const tpl = "accounts/inviteShopOwner";
  const subject = "accounts/inviteShopOwner/subject";

  SSR.compileTemplate(tpl, Reaction.Email.getTemplate(tpl));
  SSR.compileTemplate(subject, Reaction.Email.getSubject(tpl));

  const emailLogo = Reaction.Email.getShopLogo(primaryShop);
  const token = Random.id();
  const currentUser = Meteor.user();
  const currentUserName = getCurrentUserName(currentUser);
  // uses primaryShop's data (name, address etc) in email copy sent to new merchant
  const dataForEmail = getDataForEmail({ shop: primaryShop, currentUserName, name, token, emailLogo });

  // 1) this should only be for new users, right?
  // 2) this doesn't happen automatically on new user creation?
  Meteor.users.update(userId, {
    $set: {
      "services.password.reset": { token, email, when: new Date() },
      name
    }
  });

  Reaction.Email.send({
    to: email,
    from: `${_.get(dataForEmail, "primaryShop.name")} <${_.get(dataForEmail, "primaryShop.emails[0].address")}>`,
    subject: SSR.render(subject, dataForEmail),
    html: SSR.render(tpl, dataForEmail)
  });

  return true;
}
