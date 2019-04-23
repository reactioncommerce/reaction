import Reaction from "/imports/plugins/core/core/server/Reaction";
import startup from "./server/no-meteor/startup";

Reaction.registerPackage({
  label: "i18n",
  name: "reaction-i18n",
  icon: "fa fa-language",
  autoEnable: true,
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
