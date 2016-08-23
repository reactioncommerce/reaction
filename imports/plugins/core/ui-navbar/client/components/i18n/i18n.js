import { Shops } from "/lib/collections";
import { Session } from "meteor/session";
import { Template } from "meteor/templating";

/**
 * i18nChooser helpers
 */

Template.CoreNavigationLanguage.helpers({
  languages: function () {
    const languages = [];
    const shop = Shops.findOne();
    if (typeof shop === "object" && shop.languages) {
      for (const language of shop.languages) {
        if (language.enabled === true) {
          language.translation = "languages." + language.label.toLowerCase();
          languages.push(language);
        }
      }
      return languages;
    }
  },
  active: function () {
    if (Session.equals("language", this.i18n)) {
      return "active";
    }
  }
});

/**
 * i18nChooser events
 */

Template.CoreNavigationLanguage.events({
  "click .i18n-language": function (event) {
    event.preventDefault();
    return Session.set("language", this.i18n);
  }
});
