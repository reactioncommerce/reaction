import _ from "lodash";
import Logger from "@reactioncommerce/logger";
import { Meteor } from "meteor/meteor";
import { Accounts as MeteorAccounts } from "meteor/accounts-base";
import { check } from "meteor/check";
import { SSR } from "meteor/meteorhacks:ssr";
import { Accounts, Shops } from "/lib/collections";
import Reaction from "/server/api/core";

/**
 * @name accounts/sendWelcomeEmail
 * @summary Send an email to consumers on sign up
 * @memberof Accounts/Methods
 * @method
 * @param {String} shopId - shopId of new User
 * @param {String} userId - new userId to welcome
 * @param {String} token - the token for the verification URL
 * @returns {Boolean} returns true on success
 */
export default function sendWelcomeEmail(shopId, userId, token) {
  check(shopId, String);
  check(userId, String);
  check(token, String);

  this.unblock();

  const account = Accounts.findOne(userId);
  // anonymous users aren't welcome here
  if (!account.emails || !account.emails.length > 0) {
    return false;
  }

  const shop = Shops.findOne(shopId);

  // Get shop logo, if available. If not, use default logo from file-system
  const emailLogo = Reaction.Email.getShopLogo(shop);
  const copyrightDate = new Date().getFullYear();
  const user = Meteor.user();
  const dataForEmail = {
    // Shop Data
    shop,
    contactEmail: shop.emails[0].address,
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
    user
  };

  dataForEmail.verificationUrl = MeteorAccounts.urls.verifyEmail(token);

  const userEmail = account.emails[0].address;
  let shopEmail;
  // provide some defaults for missing shop email.
  if (!shop.emails) {
    shopEmail = `${shop.name}@localhost`;
    Logger.debug(`Shop email address not configured. Using ${shopEmail}`);
  } else {
    shopEmail = shop.emails[0].address;
  }

  const tpl = "accounts/sendWelcomeEmail";
  const subject = "accounts/sendWelcomeEmail/subject";
  SSR.compileTemplate(tpl, Reaction.Email.getTemplate(tpl));
  SSR.compileTemplate(subject, Reaction.Email.getSubject(tpl));

  Reaction.Email.send({
    to: userEmail,
    from: `${shop.name} <${shopEmail}>`,
    subject: SSR.render(subject, dataForEmail),
    html: SSR.render(tpl, dataForEmail)
  });

  return true;
}
