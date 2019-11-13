import SimpleSchema from "simpl-schema";
import nodemailer from "@reactioncommerce/nodemailer";
import ReactionError from "@reactioncommerce/reaction-error";
import { SMTPConfig } from "../config.js";

const inputSchema = new SimpleSchema({
  shopId: String
});

/**
 * @name verifySMTPEmailSettings
 * @summary Verify the current email configuration
 * @param {Object} context - an object containing the per-request state
 * @param {Object} input - an object of all mutation arguments that were sent by the client
 * @param {String} input.shopId - ShopID this setting belongs to.
 * @returns {Boolean} - returns true if SMTP connection succeeds
 */
export default async function verifySMTPEmailSettings(context, input) {
  inputSchema.validate(input);

  const { checkPermissions } = context;
  const { shopId } = input;

  await checkPermissions(["owner", "admin", "dashboard"], shopId);

  const transporter = nodemailer.createTransport(SMTPConfig);

  let isVerified;
  try {
    isVerified = await transporter.verify();
  } catch (error) {
    throw new ReactionError(error.responseCode, error.response);
  }

  return isVerified;
}
