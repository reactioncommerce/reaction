import _ from "lodash";
import generateVerificationTokenObject from "@reactioncommerce/api-utils/generateVerificationTokenObject.js";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";

/**
 * @method sendVerificationEmail
 * @summary Send an email with a link the user can use verify their email address.
 * @param {Object} context Startup context
 * @param {Object} input Input options
 * @param {String} input.userId - The id of the user to send email to.
 * @param {String} [input.email] Optional. Address to send the email to.
 *                 This address must be in the user's emails list.
 *                 Defaults to the first unverified email in the list.
 * @param {String} [input.bodyTemplate] Template name for rendering the email body
 * @returns {Job} - returns a sendEmail Job instance
 */
export default async function sendVerificationEmail(context, { bodyTemplate = "accounts/verifyEmail", email, shopId, userId }) {
  const { collections } = context;
  const { Accounts, Shops, users } = collections;

  const user = await users.findOne({ _id: userId });

  if (!user) throw new ReactionError("not-found", `User ${userId} not found`);

  const account = await Accounts.findOne({ userId });

  if (!account) throw new ReactionError("not-found", "Account not found");

  let address = email;

  // pick the first unverified address if no address provided.
  if (!email) {
    const unverifiedEmail = _.find(user.emails || [], (item) => !item.verified) || {};

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

  const tokenObj = generateVerificationTokenObject({ address });

  await users.update({ _id: userId }, {
    $push: {
      "services.email.verificationTokens": tokenObj
    }
  });

  const shop = await Shops.findOne({ _id: shopId });

  if (!shop) throw new ReactionError("not-found", "Shop not found");

  const shopName = shop.name;
  const url = context.getAbsoluteUrl(`#/verify-email/${tokenObj.token}`);
  const copyrightDate = new Date().getFullYear();

  const dataForEmail = {
    // Reaction Information
    contactEmail: _.get(shop, "emails[0].address"),
    homepage: context.getAbsoluteUrl(),
    emailLogo: `${context.getAbsoluteUrl()}resources/placeholder.gif`,
    copyrightDate,
    legalName: _.get(shop, "addressBook[0].company"),
    physicalAddress: {
      address: `${_.get(shop, "addressBook[0].address1")} ${_.get(shop, "addressBook[0].address2")}`,
      city: _.get(shop, "addressBook[0].city"),
      region: _.get(shop, "addressBook[0].region"),
      postal: _.get(shop, "addressBook[0].postal")
    },
    shopName,
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
    confirmationUrl: url,
    userEmailAddress: address
  };

  const language = (account.profile && account.profile.language) || shop.language;

  return context.mutations.sendEmail(context, {
    data: dataForEmail,
    fromShop: shop,
    templateName: bodyTemplate,
    language,
    to: address
  });
}
