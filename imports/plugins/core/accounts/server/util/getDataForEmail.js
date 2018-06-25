import _ from "lodash";
import { Meteor } from "meteor/meteor";
import { Accounts as MeteorAccounts } from "meteor/accounts-base";
import { Shops } from "/lib/collections";
import Reaction from "/imports/plugins/core/core/server/Reaction";

/**
 * @name getDataForEmail
 * @memberof Accounts/Methods
 * @method
 * @private
 * @param  {Object} options - shop, currentUserName, token, emailLogo, name
 * @return {Object} data - primaryShop, shop, contactEmail, homepage,
 * emailLogo, legalName, physicalAddress, shopName, socialLinks, user, invitedUserName, url
 */
export default function getDataForEmail(options) {
  const { shop, currentUserName, token, emailLogo, name, url } = options;
  const primaryShop = Shops.findOne(Reaction.getPrimaryShopId());
  const copyrightDate = new Date().getFullYear();

  function getEmailUrl(userToken) {
    if (userToken) {
      return MeteorAccounts.urls.enrollAccount(userToken);
    }
    return Meteor.absoluteUrl();
  }

  return {
    primaryShop, // Primary shop data - may or may not be the same as shop
    shop, // Shop Data
    contactEmail: _.get(shop, "emails[0].address"),
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
    user: Meteor.user(), // Account Data
    currentUserName,
    invitedUserName: name,
    url: url || getEmailUrl(token)
  };
}
