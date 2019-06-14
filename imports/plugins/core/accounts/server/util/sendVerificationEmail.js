import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import { Meteor } from "meteor/meteor";
import { Accounts as MeteorAccounts } from "meteor/accounts-base";
import { Accounts } from "/lib/collections";
import { SSR } from "meteor/meteorhacks:ssr";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @method sendVerificationEmail
 * @summary Send an email with a link the user can use verify their email address.
 * @param {Object} input Input options
 * @param {String} input.userId - The id of the user to send email to.
 * @param {String} [input.email] Optional. Address to send the email to.
 *                 This address must be in the user's emails list.
 *                 Defaults to the first unverified email in the list.
 * @param {String} [input.bodyTemplate] Template name for rendering the email body
 * @param {String} [input.subjectTemplate] Template name for rendering the email subject
 * @return {Job} - returns a sendEmail Job instance
 */
export default async function sendVerificationEmail({
  bodyTemplate = "accounts/verifyEmail",
  email,
  subjectTemplate = "accounts/verifyEmail/subject",
  userId
}) {
  // Make sure the user exists, and email is one of their addresses.
  const user = Meteor.users.findOne(userId);

  if (!user) {
    Logger.error("sendVerificationEmail - User not found");
    throw new ReactionError("not-found", "User not found");
  }

  let address = email;

  // pick the first unverified address if no address provided.
  if (!email) {
    const unverifiedEmail = _.find(user.emails || [], (e) => !e.verified) || {};

    ({ address } = unverifiedEmail);

    if (!address) {
      const msg = "No unverified email addresses found.";
      Logger.error(msg);
      throw new ReactionError("not-found", msg);
    }
  }

  // make sure we have a valid address
  if (!address || !user.emails || !(user.emails.map((mailInfo) => mailInfo.address).includes(address))) {
    const msg = "Email not found for user";
    Logger.error(msg);
    throw new ReactionError("not-found", msg);
  }

  const token = Random.secret();
  const when = new Date();
  const tokenObj = { token, address, when };

  Meteor.users.update({ _id: userId }, {
    $push: {
      "services.email.verificationTokens": tokenObj
    }
  });

  const shopName = Reaction.getShopName();
  const url = MeteorAccounts.urls.verifyEmail(token);
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

  if (!Reaction.Email.getMailUrl()) {
    Logger.warn(`

  ***************************************************
          IMPORTANT! EMAIL VERIFICATION LINK

           Email sending is not configured.

  Go to the following URL to verify email: ${address}

  ${url}
  ***************************************************

    `);
  }

  const account = Accounts.findOne({ userId }, { _id: 0, profile: 1 });
  const language = account && account.profile && account.profile.language;

  SSR.compileTemplate(bodyTemplate, Reaction.Email.getTemplate(bodyTemplate, language));
  SSR.compileTemplate(subjectTemplate, Reaction.Email.getSubject(bodyTemplate, language));

  return Reaction.Email.send({
    to: address,
    from: Reaction.getShopEmail(),
    subject: SSR.render(subjectTemplate, dataForEmail),
    html: SSR.render(bodyTemplate, dataForEmail)
  });
}
