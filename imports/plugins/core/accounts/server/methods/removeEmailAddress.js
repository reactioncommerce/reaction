import _ from "lodash";
import Hooks from "@reactioncommerce/hooks";
import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";
import { Meteor } from "meteor/meteor";
import { Accounts as MeteorAccounts } from "meteor/accounts-base";
import { check } from "meteor/check";
import { SSR } from "meteor/meteorhacks:ssr";
import { Accounts } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import ReactionError from "/imports/plugins/core/graphql/server/no-meteor/ReactionError";

/**
 * @method sendUpdatedVerificationEmail
 * @memberof Core
 * @summary Send an email with a link the user can use to verify their updated email address.
 * @param {String} userId - The id of the user to send email to.
 * @param {String} [email] Optional. Address to send the email to.
 *                 This address must be in the user's emails list.
 *                 Defaults to the first unverified email in the list.
 * @return {Job} - returns a sendEmail Job instance
 */
async function sendUpdatedVerificationEmail(userId, email) {
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

  const tpl = "accounts/verifyUpdatedEmail";
  const subject = "accounts/verifyUpdatedEmail/subject";

  SSR.compileTemplate(tpl, Reaction.Email.getTemplate(tpl));
  SSR.compileTemplate(subject, Reaction.Email.getSubject(tpl));

  return Reaction.Email.send({
    to: address,
    from: Reaction.getShopEmail(),
    subject: SSR.render(subject, dataForEmail),
    html: SSR.render(tpl, dataForEmail)
  });
}


/**
 * @name accounts/syncUsersAndAccounts
 * @memberof Accounts/Methods
 * @method
 * @summary Syncs emails associated with a user profile between the Users and Accounts collections.
 * @returns {Boolean} - returns boolean.
 */
function syncUsersAndAccounts() {
  const user = Meteor.user();

  Accounts.update({
    _id: user._id
  }, {
    $set: {
      emails: [
        user.emails[0]
      ]
    }
  });
  Hooks.Events.run("afterAccountsUpdate", user._id, {
    accountId: user._id,
    updatedFields: ["emails"]
  });

  return true;
}

/**
 * @name accounts/removeEmailAddress
 * @memberof Accounts/Methods
 * @method
 * @summary Remove a user's email address.
 * @param {String} email - user email.
 * @returns {Boolean} - returns boolean.
 */
export default function removeEmailAddress(email) {
  check(email, String);

  const user = Meteor.user();

  // Remove email address from user
  MeteorAccounts.removeEmail(user._id, email);

  // Verify new address
  sendUpdatedVerificationEmail(user._id);

  // Sync users and accounts collections
  syncUsersAndAccounts();

  return true;
}
