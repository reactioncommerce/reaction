import startup from "./startup";

/**
 * @summary Import and call this function to add this plugin to your API.
 * @param {ReactionNodeApp} app The ReactionNodeApp instance
 * @return {undefined}
 */
export default async function register(app) {
  await app.registerPlugin({
    label: "i18n",
    name: "reaction-i18n",
    icon: "fa fa-language",
    autoEnable: true,
    collections: {
      Translations: {
        name: "Translations",
        indexes: [
          // Create indexes. We set specific names for backwards compatibility
          // with indexes created by the aldeed:schema-index Meteor package.
          [{ shopId: 1, i18n: 1 }]
        ]
      }
    },
    functionsByType: {
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
