import _ from "lodash";
import SimpleSchema from "simpl-schema";
import generateVerificationTokenObject from "@reactioncommerce/api-utils/generateVerificationTokenObject.js";
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
  const { collections } = context;
  const { Shops, users } = collections;

  // Make sure the user exists, and email is one of their addresses.
  const user = await users.findOne({ _id: account.userId });
  if (!user) throw new ReactionError("not-found", "User not found");

  // make sure we have a valid email
  if (!email || !user.emails || !user.emails.map((mailInfo) => mailInfo.address).includes(email)) {
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

  // Fall back to primary shop if account has no shop linked
  let shop;
  if (account.shopId) {
    shop = await Shops.findOne({ _id: account.shopId });
  } else {
    shop = await Shops.findOne({ shopType: "primary" });
  }

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
    passwordResetUrl: REACTION_IDENTITY_PUBLIC_PASSWORD_RESET_URL.replace("TOKEN", tokenObj.token),
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

  const caseInsensitiveEmail = email.toLowerCase();

  const account = await Accounts.findOne({ "emails.address": caseInsensitiveEmail });
  if (!account) throw new ReactionError("not-found", "Account not found");

  await sendResetEmail(context, account, caseInsensitiveEmail);

  return email;
}
