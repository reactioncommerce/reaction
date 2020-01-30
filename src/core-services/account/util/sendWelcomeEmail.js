import _ from "lodash";
import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import config from "../config.js";

const { REACTION_IDENTITY_PUBLIC_VERIFY_EMAIL_URL } = config;

const inputSchema = new SimpleSchema({
  accountId: String
});

/**
 * @name sendWelcomeEmail
 * @summary Send an email to consumers on sign up
 * @method
 * @param {Object} context - GraphQL execution context
 * @param {Object} input - Necessary input for mutation. See SimpleSchema.
 * @param {String} input.accountId - new userId to welcome
 * @returns {Boolean} returns true on success
 */
export default async function sendWelcomeEmail(context, input) {
  inputSchema.validate(input);
  const { collections } = context;
  const { Accounts, Shops } = collections;
  const { accountId } = input;

  const account = await Accounts.findOne({ _id: accountId });
  if (!account) throw new Error(`Account with ID ${accountId} not found`);

  const { userId } = account;

  let result;
  try {
    result = await context.mutations.startIdentityEmailVerification(context, {
      userId
    });
  } catch (error) {
    // This will throw an error if there are no email addresses or none needing
    // validation, or if `startIdentityEmailVerification` doesn't exist because
    // verification isn't supported. That's ok.
    return false;
  }

  const { email, token } = result;

  // Account emails are always sent from the primary shop email and using primary shop
  // email templates.
  const shop = await Shops.findOne({ shopType: "primary" });
  if (!shop) throw new ReactionError("not-found", "Shop not found");

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
    verificationUrl: REACTION_IDENTITY_PUBLIC_VERIFY_EMAIL_URL.replace("TOKEN", token)
  };

  const language = (account.profile && account.profile.language) || shop.language;

  await context.mutations.sendEmail(context, {
    data: dataForEmail,
    fromShop: shop,
    templateName: "accounts/sendWelcomeEmail",
    language,
    to: email
  });

  return true;
}
