import _ from "lodash";
import { Random } from "meteor/random";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { SSR } from "meteor/meteorhacks:ssr";
import { Shops } from "/lib/collections";
import { Reaction, Logger } from "/server/api";

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
export async function sendResetPasswordEmail(userId, optionalEmail) {
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
 * @method sendVerificationEmail
 * @memberof Core
 * @summary Send an email with a link the user can use verify their email address.
 * @param {String} userId - The id of the user to send email to.
 * @param {String} [email] Optional. Address to send the email to.
 *                 This address must be in the user's emails list.
 *                 Defaults to the first unverified email in the list.
 * @return {Job} - returns a sendEmail Job instance
 */
export async function sendVerificationEmail(userId, email) {
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

  const shopName = Reaction.getShopName();
  const url = Accounts.urls.verifyEmail(token);
  const copyrightDate = new Date().getFullYear();

  const dataForEmail = {
    // Reaction Information
    contactEmail: "hello@reactioncommerce.com",
    homepage: Meteor.absoluteUrl(),
    emailLogo: `${Meteor.absoluteUrl()}resources/placeholder.gif`,
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

  const tpl = "accounts/verifyEmail";
  const subject = "accounts/verifyEmail/subject";

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
 * @method sendUpdatedVerificationEmail
 * @memberof Core
 * @summary Send an email with a link the user can use to verify their updated email address.
 * @param {String} userId - The id of the user to send email to.
 * @param {String} [email] Optional. Address to send the email to.
 *                 This address must be in the user's emails list.
 *                 Defaults to the first unverified email in the list.
 * @return {Job} - returns a sendEmail Job instance
 */
export async function sendUpdatedVerificationEmail(userId, email) {
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

  const shopName = Reaction.getShopName();
  const url = Accounts.urls.verifyEmail(token);
  const copyrightDate = new Date().getFullYear();

  const dataForEmail = {
    // Reaction Information
    contactEmail: "hello@reactioncommerce.com",
    homepage: Meteor.absoluteUrl(),
    emailLogo: `${Meteor.absoluteUrl()}resources/placeholder.gif`,
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
