import Logger from "@reactioncommerce/logger";
import Random from "@reactioncommerce/random";

/**
 * @param {Object} context App context
 * @param {String} shopId Shop ID
 * @param {Object} doc The template document
 * @returns {undefined}
 */
export default async function seedEmailTemplate(context, shopId, doc) {
  const { Templates } = context.collections;

  const existing = await Templates.findOne({ language: doc.language, name: doc.name, shopId, type: "email" });
  if (!existing) {
    Logger.debug(`Seeding database with default email template "${doc.name}" for shop ${shopId}`);
    await Templates.insertOne({
      ...doc,
      _id: Random.id(),
      parser: "handlebars",
      shopId,
      type: "email"
    });
  }
}
