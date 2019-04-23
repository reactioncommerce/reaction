import seedEmailTemplates from "./util/seedEmailTemplates";

/**
 * @name startup
 * @summary Called on startup. Initializes SMTP email handler.
 * @param {Object} context App context
 * @return {undefined}
 */
export default async function startup(context) {
  await seedEmailTemplates(context);
}
