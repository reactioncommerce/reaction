import _ from "lodash";
import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import config from "../config.js";

const { REACTION_IDENTITY_PUBLIC_PASSWORD_RESET_URL } = config;

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
  const {
    collections: { Shops },
    mutations: { startIdentityPasswordReset }
  } = context;

  if (typeof startIdentityPasswordReset !== "function") {
    throw new ReactionError("not-supported", "Password reset not supported");
  }

  const { token } = await startIdentityPasswordReset(context, {
    email,
    userId: account.userId
  });

  // Account emails are always sent from the primary shop email and using primary shop
  // email templates.
  const shop = await Shops.findOne({ shopType: "primary" });
  if (!shop) throw new ReactionError("not-found", "Shop not found");

  const contactEmail = shop.emails && shop.emails[0] && shop.emails[0].address;

  const dataForEmail = {
    contactEmail,
    homepage: _.get(shop, "storefrontUrls.storefrontHomeUrl", null),
    copyrightDate: new Date().getFullYear(),
    legalName: _.get(shop, "addressBook[0].company"),
    physicalAddress: {
      address: `${_.get(shop, "addressBook[0].address1")} ${_.get(shop, "addressBook[0].address2")}`,
      city: _.get(shop, "addressBook[0].city"),
      region: _.get(shop, "addressBook[0].region"),
      postal: _.get(shop, "addressBook[0].postal")
    },
    shopName: shop.name,
    // Account Data
    passwordResetUrl: REACTION_IDENTITY_PUBLIC_PASSWORD_RESET_URL.replace("TOKEN", token)
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

  const caseInsensitiveEmail = email.toLowerCase();

  const account = await Accounts.findOne({ "emails.address": caseInsensitiveEmail });
  if (!account) throw new ReactionError("not-found", "Account not found");

  await sendResetEmail(context, account, caseInsensitiveEmail);

  return email;
}
