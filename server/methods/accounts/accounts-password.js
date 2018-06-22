import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import { Accounts } from "meteor/accounts-base";
import { check } from "meteor/check";
import { Meteor } from "meteor/meteor";
import { SSR } from "meteor/meteorhacks:ssr";
import { Shops } from "/lib/collections";
import Reaction from "/server/api/core";

/**
 * @method sendResetPasswordEmail
 * @memberof Core
 * @summary Send an email with a link that the user can use to reset their password.
 * @param {String} userId - The id of the user to send email to.
 * @param {String} [optionalEmail] Address to send the email to.
 *                 This address must be in the user's `emails` list.
 *                 Defaults to the first email in the list.
 * @return {Job} - returns a sendEmail Job instance
 */
async function sendResetPasswordEmail(userId, optionalEmail) {
  // Make sure the user exists, and email is one of their addresses.
  const user = Meteor.users.findOne(userId);

  if (!user) {
    Logger.error("sendResetPasswordEmail - User not found");
    throw new Meteor.Error("not-found", "User not found");
  }

  let email = optionalEmail;

  // pick the first email if we weren't passed an email.
  if (!optionalEmail && user.emails && user.emails[0]) {
    email = user.emails[0].address;
  }

  // make sure we have a valid email
  if (!email || !user.emails || !user.emails.map((mailInfo) => mailInfo.address).includes(email)) {
    Logger.error("sendResetPasswordEmail - Email not found");
    throw new Meteor.Error("not-found", "Email not found");
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
  const emailLogo = Reaction.Email.getShopLogo(shop);
  const copyrightDate = new Date().getFullYear();

  const dataForEmail = {
    // Shop Data
    shop,
    contactEmail: shop.emails[0].address,
    homepage: Meteor.absoluteUrl(),
    emailLogo,
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
        icon: `${Meteor.absoluteUrl()}resources/email-templates/facebook-icon.png`,
        link: "https://www.facebook.com"
      },
      googlePlus: {
        display: true,
        icon: `${Meteor.absoluteUrl()}resources/email-templates/google-plus-icon.png`,
        link: "https://plus.google.com"
      },
      twitter: {
        display: true,
        icon: `${Meteor.absoluteUrl()}resources/email-templates/twitter-icon.png`,
        link: "https://www.twitter.com"
      }
    },
    // Account Data
    passwordResetUrl: Accounts.urls.resetPassword(token),
    user
  };

  // Compile Email with SSR
  const tpl = "accounts/resetPassword";
  const subject = "accounts/resetPassword/subject";
  SSR.compileTemplate(tpl, Reaction.Email.getTemplate(tpl));
  SSR.compileTemplate(subject, Reaction.Email.getSubject(tpl));

  return Reaction.Email.send({
    to: email,
    from: Reaction.getShopEmail(),
    subject: SSR.render(subject, dataForEmail),
    html: SSR.render(tpl, dataForEmail)
  });
}

/**
 * @name accounts/sendResetPasswordEmail
 * @memberof Accounts/Methods
 * @method
 * @example Meteor.call("accounts/sendResetPasswordEmail", options)
 * @summary Send reset password email
 * @param {Object} options
 * @param {String} options.email - email of user
 * @returns {false}
 */
Meteor.methods({
  "accounts/sendResetPasswordEmail"(options) {
    check(options, {
      email: String
    });

    const user = Accounts.findUserByEmail(options.email);

    if (!user) {
      Logger.error("accounts/sendResetPasswordEmail - User not found");
      throw new Meteor.Error("not-found", "User not found");
    }

    const emails = _.map(user.emails || [], "address");

    const caseInsensitiveEmail = _.find(emails, (email) => email.toLowerCase() === options.email.toLowerCase());

    sendResetPasswordEmail(user._id, caseInsensitiveEmail);
  }
});
