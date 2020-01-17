import i18n from "./i18n/index.js";
import { registerPluginHandlerForI18n } from "./registration.js";
import startup from "./startup.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionAPI} app The ReactionAPI instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "i18n",
    name: "reaction-i18n",
    version: app.context.appVersion,
    i18n,
    functionsByType: {
      registerPluginHandler: [registerPluginHandlerForI18n],
      startup: [startup]
    }
  });
}
