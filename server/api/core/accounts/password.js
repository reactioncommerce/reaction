import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Accounts } from "meteor/accounts-base";
import { SSR } from "meteor/meteorhacks:ssr";
import { Media, Shops } from "/lib/collections";
import { Reaction, Logger } from "/server/api";


/**
 * Send an email with a link that the user can use to reset their password.
 * @param {String} userId - The id of the user to send email to.
 * @param {String} [optionalEmail] Address to send the email to.
 *                 This address must be in the user's `emails` list.
 *                 Defaults to the first email in the list.
 * @return {Job} - returns a sendEmail Job instance
 */
export function sendResetPasswordEmail(userId, optionalEmail) {
  // Make sure the user exists, and email is one of their addresses.
  const user = Meteor.users.findOne(userId);

  if (!user) {
    Logger.error("sendResetPasswordEmail - User not found");
    throw new Meteor.Error("user-not-found", "User not found");
  }

  let email = optionalEmail;

  // pick the first email if we weren't passed an email.
  if (!optionalEmail && user.emails && user.emails[0]) {
    email = user.emails[0].address;
  }

  // make sure we have a valid email
  if (!email || !_.includes(_.map(user.emails || [], "address"), email)) {
    Logger.error("sendResetPasswordEmail - Email not found");
    throw new Meteor.Error("email-not-found", "Email not found");
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

  // Get shop logo, if available. If not, use default logo from file-system
  let emailLogo;
  if (Array.isArray(shop.brandAssets)) {
    const brandAsset = _.find(shop.brandAssets, (asset) => asset.type === "navbarBrandImage");
    const mediaId = Media.findOne(brandAsset.mediaId);
    emailLogo = path.join(Meteor.absoluteUrl(), mediaId.url());
  } else {
    emailLogo = Meteor.absoluteUrl() + "resources/email-templates/shop-logo.png";
  }

  const dataForEmail = {
    // Shop Data
    shop: shop,
    contactEmail: shop.emails[0].address,
    homepage: Meteor.absoluteUrl(),
    emailLogo: emailLogo,
    copyrightDate: moment().format("YYYY"),
    legalName: shop.addressBook[0].company,
    physicalAddress: {
      address: shop.addressBook[0].address1 + " " + shop.addressBook[0].address2,
      city: shop.addressBook[0].city,
      region: shop.addressBook[0].region,
      postal: shop.addressBook[0].postal
    },
    shopName: shop.name,
    socialLinks: {
      display: true,
      facebook: {
        display: true,
        icon: Meteor.absoluteUrl() + "resources/email-templates/facebook-icon.png",
        link: "https://www.facebook.com"
      },
      googlePlus: {
        display: true,
        icon: Meteor.absoluteUrl() + "resources/email-templates/google-plus-icon.png",
        link: "https://plus.google.com"
      },
      twitter: {
        display: true,
        icon: Meteor.absoluteUrl() + "resources/email-templates/twitter-icon.png",
        link: "https://www.twitter.com"
      }
    },
    // Account Data
    passwordResetUrl: Accounts.urls.resetPassword(token),
    user: user
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
 * Send an email with a link the user can use verify their email address.
 * @param {String} userId - The id of the user to send email to.
 * @param {String} [email] Optional. Address to send the email to.
 *                 This address must be in the user's emails list.
 *                 Defaults to the first unverified email in the list.
 * @return {Job} - returns a sendEmail Job instance
 */
export function sendVerificationEmail(userId, email) {
  // Make sure the user exists, and email is one of their addresses.
  const user = Meteor.users.findOne(userId);

  if (!user) {
    Logger.error("sendVerificationEmail - User not found");
    throw new Meteor.Error("user-not-found", "User not found");
  }

  let address = email;

  // pick the first unverified address if no address provided.
  if (!email) {
    const unverifiedEmail = _.find(user.emails || [], (e) => !e.verified) || {};

    address = unverifiedEmail.address;

    if (!address) {
      const msg = "No unverified email addresses found.";
      Logger.error(msg);
      throw new Meteor.Error("no-unverified-address", msg);
    }
  }

  // make sure we have a valid address
  if (!address || !_.includes(_.map(user.emails || [], "address"), address)) {
    const msg = "Email not found for user";
    Logger.error(msg);
    throw new Meteor.Error("email-not-found", msg);
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

  const dataForEmail = {
    // Reaction Information
    contactEmail: "hello@reactioncommerce.com",
    homepage: Meteor.absoluteUrl(),
    emailLogo: Meteor.absoluteUrl() + "resources/placeholder.gif",
    copyrightDate: moment().format("YYYY"),
    legalName: "Reaction Commerce",
    physicalAddress: {
      address: "2110 Main Street, Suite 207",
      city: "Santa Monica",
      region: "CA",
      postal: "90405"
    },
    shopName: shopName,
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
  SSR.compileTemplate(subject, Reaction.Email.getSubject(subject));

  return Reaction.Email.send({
    to: address,
    from: Reaction.getShopEmail(),
    subject: SSR.render(subject, dataForEmail),
    html: SSR.render(tpl, dataForEmail)
  });
}
