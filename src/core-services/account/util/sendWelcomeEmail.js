import _ from "lodash";
import SimpleSchema from "simpl-schema";
import generateVerificationTokenObject from "@reactioncommerce/api-utils/generateVerificationTokenObject.js";

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
  const { Accounts, Shops, users } = collections;
  const { accountId } = input;

  const account = await Accounts.findOne({ _id: accountId });
  if (!account) throw new Error(`Account with ID ${accountId} not found`);

  const userEmail = account.emails && account.emails[0];

  // Verify that we have an account and it has an email address that isn't yet verified
  if (!userEmail || userEmail.verified) return false;

  const { shopId, userId } = account;

  // Generate a token for the user to verify their email address
  const tokenObj = generateVerificationTokenObject({ address: userEmail.address });

  await users.updateOne({ _id: userId }, {
    $push: {
      "services.email.verificationTokens": tokenObj
    }
  });

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
      display: false
    },
    verificationUrl: context.getAbsoluteUrl(`#/verify-email/${tokenObj.token}`)
  };

  const language = (account.profile && account.profile.language) || shop.language;

  await context.mutations.sendEmail(context, {
    data: dataForEmail,
    fromShop: shop,
    templateName: "accounts/sendWelcomeEmail",
    language,
    to: userEmail.address
  });

  return true;
}
