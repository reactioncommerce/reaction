import _ from "lodash";

export const ENROLL_URI_BASE = "account/enroll";

/**
 * @name getDataForEmail
 * @memberof Accounts/Methods
 * @method
 * @private
 * @param {Object} context - GraphQL execution context
 * @param  {Object} options - shop, currentUserName, token, name
 * @returns {Object} data - primaryShop, shop, contactEmail, homepage,
 * legalName, physicalAddress, shopName, socialLinks, user, invitedUserName, url
 */
export default async function getDataForEmail(context, options) {
  const { collections } = context;
  const { Shops } = collections;
  const { shop, currentUserName, token, name, url } = options;
  const primaryShop = await Shops.findOne({ shopType: "primary" });
  const copyrightDate = new Date().getFullYear();

  /**
   * @param {String} userToken token of user
   * @returns {String} url
   */
  function getEmailUrl(userToken) {
    if (userToken) {
      return context.getAbsoluteUrl(`${ENROLL_URI_BASE}/${userToken}`);
    }
    return context.getAbsoluteUrl();
  }

  return {
    primaryShop, // Primary shop data - may or may not be the same as shop
    shop, // Shop Data
    contactEmail: _.get(shop, "emails[0].address"),
    homepage: context.getAbsoluteUrl(),
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
        icon: `${context.getAbsoluteUrl()}resources/email-templates/facebook-icon.png`,
        link: "https://www.facebook.com"
      },
      googlePlus: {
        display: true,
        icon: `${context.getAbsoluteUrl()}resources/email-templates/google-plus-icon.png`,
        link: "https://plus.google.com"
      },
      twitter: {
        display: true,
        icon: `${context.getAbsoluteUrl()}resources/email-templates/twitter-icon.png`,
        link: "https://www.twitter.com"
      }
    },
    currentUserName,
    invitedUserName: name,
    url: url || getEmailUrl(token)
  };
}
