import SimpleSchema from "simpl-schema";
import Logger from "@reactioncommerce/logger";

const inputSchema = new SimpleSchema({
  host: {
    type: String,
    optional: true
  },
  password: String,
  port: {
    type: Number,
    optional: true
  },
  service: String,
  shopId: String,
  user: String
});

/**
 * @name updateSMTPEmailSettings
 * @param {Object} context - Per request state
 * @param {Object} input - Mutation arguments sent by the client
 * @param {String} [input.host] - The host fo the SMTP email service.
 * @param {String} [input.password] - Password of the SMTP email service account
 * @param {String} [input.port] - Port of the SMTP email service
 * @param {String} [input.service] - SMTP email service name
 * @param {String} [input.shopId] - shopId these settings belong to
 * @param {String} [input.user] - Username of the SMTP email service account
 * @returns {Promise<Object>} Updated SMTP mail settings
 */
export default async function updateSMTPEmailSettings(context, input) {
  inputSchema.validate(input);

  const { checkPermissions, collections: { Packages } } = context;
  const { shopId, ...rest } = input;

  await checkPermissions(["owner", "admin", "dashboard"], shopId);

  await Packages.updateOne(
    { name: "core", shopId },
    {
      $set: {
        "settings.mail": { ...rest }
      }
    }
  );

  const updatedSMTPSettings = await Packages.findOne({ name: "core", shopId });

  delete input.password;
  Logger.info("SMTP email settings updated");

  return updatedSMTPSettings.settings.mail;
}

