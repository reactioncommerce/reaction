import _ from "lodash";
import SimpleSchema from "simpl-schema";

const inputSchema = new SimpleSchema({
  shopId: String,
  token: String,
  userId: String
});

/**
 * @name sendWelcomeEmail
 * @summary Send an email to consumers on sign up
 * @method
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Necessary input for mutation. See SimpleSchema.
 * @param {String} input.shopId - shopId of new User
 * @param {String} input.token - the token for the verification URL
 * @param {String} input.userId - new userId to welcome
 * @returns {Boolean} returns true on success
 */
export default async function sendWelcomeEmail(context, input) {
  inputSchema.validate(input);
  const { collections } = context;
  const { Accounts, Shops } = collections;
  const { shopId, token, userId } = input;

  const account = await Accounts.findOne({ userId });

  // Anonymous users don't receive a welcome email
  if (!account || !account.emails || !account.emails.length > 0) return false;

  const shop = await Shops.findOne({ _id: shopId });

  const copyrightDate = new Date().getFullYear();
  const dataForEmail = {
    // Shop Data
    contactEmail: _.get(shop, "emails[0].address"),
    copyrightDate,
    legalName: _.get(shop, "addressBook[0].company"),
    physicalAddress: {
      address: `${_.get(shop, "addressBook[0].address1")} ${_.get(shop, "addressBook[0].address2")}`,
      city: _.get(shop, "addressBook[0].city"),
      region: _.get(shop, "addressBook[0].region"),
      postal: _.get(shop, "addressBook[0].postal")
    },
    shop,
    shopName: shop.name,
    socialLinks: {
      display: true,
      facebook: {
        display: true,
        icon: context.getAbsoluteUrl("resources/email-templates/facebook-icon.png"),
        link: "https://www.facebook.com"
      },
      googlePlus: {
        display: true,
        icon: context.getAbsoluteUrl("resources/email-templates/google-plus-icon.png"),
        link: "https://plus.google.com"
      },
      twitter: {
        display: true,
        icon: context.getAbsoluteUrl("resources/email-templates/twitter-icon.png"),
        link: "https://www.twitter.com"
      }
    },
    verificationUrl: context.getAbsoluteUrl(`#/verify-email/${token}`)
  };

  const userEmail = account.emails[0].address;
  const language = (account.profile && account.profile.language) || shop.language;

  await context.mutations.sendEmail(context, {
    data: dataForEmail,
    fromShop: shop,
    templateName: "accounts/sendWelcomeEmail",
    language,
    to: userEmail
  });

  return true;
}
