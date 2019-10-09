import i18n from "./i18n/index.js";
import { registerPluginHandler } from "./registration.js";
import startup from "./startup.js";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @returns {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "i18n",
    name: "reaction-i18n",
    i18n,
    functionsByType: {
      registerPluginHandler: [registerPluginHandler],
      startup: [startup]
    },
    settings: {
      name: "i18n"
    },
    registry: [{
      provides: ["dashboard"],
      label: "i18n",
      description: "Internationalization utilities",
      icon: "fa fa-language",
      priority: 1,
      container: "utilities"
    }, {
      provides: ["settings"],
      template: "i18nSettings",
      label: "Localization and i18n",
      icon: "fa fa-language",
      container: "reaction-i18n"
    }]
  });
}
