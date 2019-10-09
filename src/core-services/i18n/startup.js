import { addTranslationRoutes } from "./translations.js";

/**
 * @summary Called on startup
 * @param {Object} context Startup context
 * @param {Object} context.collections Map of MongoDB collections
 * @returns {undefined}
 */
export default async function startup(context) {
  const { app } = context;

  if (app.expressApp) addTranslationRoutes(app.expressApp);
}
