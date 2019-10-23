import _ from "lodash";
import SimpleSchema from "simpl-schema";
import generateVerificationTokenObject from "@reactioncommerce/api-utils/generateVerificationTokenObject.js";
import Logger from "@reactioncommerce/logger";
import ReactionError from "@reactioncommerce/reaction-error";

const inputSchema = new SimpleSchema({
  email: String
});

/**
 * @method sendResetEmail
 * @memberof Core
 * @summary Send an email with a link that the user can use to reset their password.
 * @param {Object} context - GraphQL execution context
 * @param {Object} account - account object that is related to email address
 * @param {String} email - email of account to reset
 * @returns {Job} - returns a sendEmail Job instance
 */
async function sendResetEmail(context, account, email) {
  const { collections } = context;
  const { Shops, users } = collections;
  // Make sure the user exists, and email is one of their addresses.
  const user = await users.findOne({ _id: account.userId });

  if (!user) {
    Logger.error("sendResetAccountPasswordEmail - User not found");
    throw new ReactionError("not-found", "User not found");
  }

  // make sure we have a valid email
  if (!email || !user.emails || !user.emails.map((mailInfo) => mailInfo.address).includes(email)) {
    Logger.error("sendResetPasswordEmail - Email not found");
    throw new ReactionError("not-found", "Email not found");
  }

  // Create token for password reset
  const tokenObj = generateVerificationTokenObject({ email });

  const { value: updatedAccount } = await users.findOneAndUpdate({ _id: account.userId }, {
    $set: {
      "services.password.reset": tokenObj
    }
  }, {
    returnOriginal: false
  });

  if (!updatedAccount) {
    throw new ReactionError("error-occurred", "Unable to set password reset token");
  }

  // Get shop data for email display
  const shop = await Shops.findOne({ _id: account.shopId });

  const copyrightDate = new Date().getFullYear();

  const dataForEmail = {
    // Shop Data
    shop,
    contactEmail: shop.emails[0].address,
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
    // Account Data
    passwordResetUrl: context.getAbsoluteUrl(`reset-password/${tokenObj.token}`),
    user
  };

  // get account profile language for email
  const language = account.profile && account.profile.language;

  return context.mutations.sendEmail(context, {
    data: dataForEmail,
    fromShop: shop,
    language,
    templateName: "accounts/resetPassword",
    to: email
  });
}

/**
 * @name accounts/sendResetAccountPasswordEmail
 * @summary Checks to see if a user exists for a given email, and sends a password password if user exists
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Necessary input for mutation. See SimpleSchema.
 * @param {String} input.email - email of account to reset
 * @return {Promise<Object>} with email address if found
 */
export default async function sendResetAccountPasswordEmail(context, input) {
  inputSchema.validate(input);
  const { collections } = context;
  const { Accounts } = collections;
  const {
    email
  } = input;

  const account = await Accounts.findOne({ "emails.address": email });

  if (!account) {
    Logger.error("sendResetAccountPasswordEmail - Account not found");
    throw new ReactionError("not-found", "Account not found");
  }

  const caseInsensitiveEmail = email.toLowerCase();

  await sendResetEmail(context, account, caseInsensitiveEmail);

  return email;
}
