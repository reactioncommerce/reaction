import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { SSR } from "meteor/meteorhacks:ssr";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import Core from "./core";
import Email from "./Email";

/**
 * @method sendVerificationEmail
 * @memberof Core
 * @summary Send an email with a link the user can use verify their email address.
 * @param {String} userId - The id of the user to send email to.
 * @param {String} [email] Optional. Address to send the email to.
 *                 This address must be in the user's emails list.
 *                 Defaults to the first unverified email in the list.
 * @return {Job} - returns a sendEmail Job instance
 */
export default async function sendVerificationEmail(userId, email) {
  // Make sure the user exists, and email is one of their addresses.
  const user = Meteor.users.findOne(userId);

  if (!user) {
    Logger.error("sendVerificationEmail - User not found");
    throw new Meteor.Error("not-found", "User not found");
  }

  let address = email;

  // pick the first unverified address if no address provided.
  if (!email) {
    const unverifiedEmail = _.find(user.emails || [], (e) => !e.verified) || {};

    ({ address } = unverifiedEmail);

    if (!address) {
      const msg = "No unverified email addresses found.";
      Logger.error(msg);
      throw new Meteor.Error("not-found", msg);
    }
  }

  // make sure we have a valid address
  if (!address || !user.emails || !(user.emails.map((mailInfo) => mailInfo.address).includes(address))) {
    const msg = "Email not found for user";
    Logger.error(msg);
    throw new Meteor.Error("not-found", msg);
  }

  const token = Random.secret();
  const when = new Date();
  const tokenObj = { token, address, when };

  Meteor.users.update({ _id: userId }, {
    $push: {
      "services.email.verificationTokens": tokenObj
    }
  });

  const shopName = Core.getShopName();
  const url = Accounts.urls.verifyEmail(token);
  const copyrightDate = new Date().getFullYear();

  const dataForEmail = {
    // Reaction Information
    contactEmail: "hello@reactioncommerce.com",
    homepage: Reaction.absoluteUrl(),
    emailLogo: `${Reaction.absoluteUrl()}resources/placeholder.gif`,
    copyrightDate,
    legalName: "Reaction Commerce",
    physicalAddress: {
      address: "2110 Main Street, Suite 207",
      city: "Santa Monica",
      region: "CA",
      postal: "90405"
    },
    shopName,
    socialLinks: {
      facebook: {
        link: "https://www.facebook.com/reactioncommerce"
      },
      github: {
        link: "https://github.com/reactioncommerce/reaction"
      },
      instagram: {
        link: "https://instagram.com/reactioncommerce"
      },
      twitter: {
        link: "https://www.twitter.com/getreaction"
      }
    },
    confirmationUrl: url,
    userEmailAddress: address
  };

  if (!Email.getMailUrl()) {
    Logger.warn(`

  ***************************************************
          IMPORTANT! EMAIL VERIFICATION LINK

           Email sending is not configured.

  Go to the following URL to verify email: ${address}

  ${url}
  ***************************************************

    `);
  }

  const tpl = "accounts/verifyEmail";
  const subject = "accounts/verifyEmail/subject";

  SSR.compileTemplate(tpl, Email.getTemplate(tpl));
  SSR.compileTemplate(subject, Email.getSubject(tpl));

  return Email.send({
    to: address,
    from: Core.getShopEmail(),
    subject: SSR.render(subject, dataForEmail),
    html: SSR.render(tpl, dataForEmail)
  });
}
