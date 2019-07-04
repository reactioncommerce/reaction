import templateDefinitions from "../templates";
import seedEmailTemplate from "./seedEmailTemplate";

/**
 * @summary Creates shop-owned email template records from the default templates
 *   that live in the codebase.
 * @param {Object} context App context
 * @param {String} shopId Shop ID
 * @return {undefined}
 */
export default async function seedEmailTemplatesForShop(context, shopId) {
  const promises = templateDefinitions.map((templateDefinition) => (
    seedEmailTemplate(context, shopId, templateDefinition)
  ));

  await Promise.all(promises);
}
