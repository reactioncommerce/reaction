import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Accounts as MeteorAccounts } from "meteor/accounts-base";
import { check } from "meteor/check";
import { Accounts, Shops } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";
import getGraphQLContextInMeteorMethod from "/imports/plugins/core/graphql/server/getGraphQLContextInMeteorMethod";

/**
 * @name sendWelcomeEmail
 * @summary Send an email to consumers on sign up
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

  const account = Accounts.findOne({ userId });
  // anonymous users aren't welcome here
  if (!account.emails || !account.emails.length > 0) {
    return false;
  }

  const shop = Shops.findOne({ _id: shopId });

  const copyrightDate = new Date().getFullYear();
  const user = Meteor.user();
  const dataForEmail = {
    // Shop Data
    shop,
    contactEmail: shop.emails[0].address,
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
    user
  };

  dataForEmail.verificationUrl = MeteorAccounts.urls.verifyEmail(token);

  const userEmail = account.emails[0].address;

  const context = Promise.await(getGraphQLContextInMeteorMethod(Reaction.getUserId()));
  Promise.await(context.mutations.sendEmail(context, {
    data: dataForEmail,
    fromShop: shop,
    templateName: "accounts/sendWelcomeEmail",
    to: userEmail
  }));

  return true;
}
