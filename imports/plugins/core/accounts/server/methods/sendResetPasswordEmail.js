import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import { Accounts } from "meteor/accounts-base";
import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { Shops } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";
import ReactionError from "@reactioncommerce/reaction-error";

Accounts.urls.resetPassword = function reset(token) {
  return Meteor.absoluteUrl(`reset-password/${token}`);
};

/**
 * @method sendResetEmail
 * @memberof Core
 * @summary Send an email with a link that the user can use to reset their password.
 * @param {String} userId - The id of the user to send email to.
 * @param {String} [optionalEmail] Address to send the email to.
 *                 This address must be in the user's `emails` list.
 *                 Defaults to the first email in the list.
 * @return {Job} - returns a sendEmail Job instance
 */
async function sendResetEmail(userId, optionalEmail) {
  // Make sure the user exists, and email is one of their addresses.
  const user = Meteor.users.findOne(userId);

  if (!user) {
    Logger.error("sendResetPasswordEmail - User not found");
    throw new ReactionError("not-found", "User not found");
  }

  let email = optionalEmail;

  // pick the first email if we weren't passed an email.
  if (!optionalEmail && user.emails && user.emails[0]) {
    email = user.emails[0].address;
  }

  // make sure we have a valid email
  if (!email || !user.emails || !user.emails.map((mailInfo) => mailInfo.address).includes(email)) {
    Logger.error("sendResetPasswordEmail - Email not found");
    throw new ReactionError("not-found", "Email not found");
  }

  // Create token for password reset
  const token = Random.secret();
  const when = new Date();
  const tokenObj = { token, email, when };

  Meteor.users.update(userId, {
    $set: {
      "services.password.reset": tokenObj
    }
  });

  Meteor._ensure(user, "services", "password").reset = tokenObj;

  // Get shop data for email display
  const shop = Shops.findOne(Reaction.getShopId());
  const copyrightDate = new Date().getFullYear();

  const dataForEmail = {
    // Shop Data
    shop,
    contactEmail: shop.emails[0].address,
    homepage: Reaction.absoluteUrl(),
    copyrightDate,
    legalName: _.get(shop, "addressBook[0].company"),
    physicalAddress: {
      address: `${_.get(shop, "addressBook[0].address1")} ${_.get(shop, "addressBook[0].address2")}`,
      city: _.get(shop, "addressBook[0].city"),
      region: _.get(shop, "addressBook[0].region"),
      postal: _.get(shop, "addressBook[0].postal")
    },
    shopName: shop.name,
    socialLinks: {
      display: true,
      facebook: {
        display: true,
        icon: `${Reaction.absoluteUrl()}resources/email-templates/facebook-icon.png`,
        link: "https://www.facebook.com"
      },
      googlePlus: {
        display: true,
        icon: `${Reaction.absoluteUrl()}resources/email-templates/google-plus-icon.png`,
        link: "https://plus.google.com"
      },
      twitter: {
        display: true,
        icon: `${Reaction.absoluteUrl()}resources/email-templates/twitter-icon.png`,
        link: "https://www.twitter.com"
      }
    },
    // Account Data
    passwordResetUrl: Accounts.urls.resetPassword(token),
    user
  };

  const context = Promise.await(getGraphQLContextInMeteorMethod(Reaction.getUserId()));
  return Promise.await(context.mutations.sendEmail(context, {
    data: dataForEmail,
    fromShop: shop,
    templateName: "accounts/resetPassword",
    to: email
  }));
}

/**
 * @name accounts/sendResetPasswordEmail
 * @memberof Accounts/Methods
 * @method
 * @example Meteor.call("accounts/sendResetPasswordEmail", options)
 * @summary Send reset password email
 * @param {Object} options Options object
 * @param {String} options.email - email of user
 * @returns {undefined}
 */
export default function sendResetPasswordEmail(options) {
  check(options, {
    email: String
  });

  const user = Accounts.findUserByEmail(options.email);

  if (!user) {
    Logger.error("accounts/sendResetPasswordEmail - User not found");
    throw new ReactionError("not-found", "User not found");
  }

  const emails = _.map(user.emails || [], "address");

  const caseInsensitiveEmail = _.find(emails, (email) => email.toLowerCase() === options.email.toLowerCase());

  sendResetEmail(user._id, caseInsensitiveEmail);
}
