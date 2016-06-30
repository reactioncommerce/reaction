import { Reaction } from "/client/api";
import { Shops } from "/lib/collections";
import { Session } from "meteor/session";

/**
 * i18nChooser helpers
 */

Template.i18nChooser.helpers({
  languages() {
    let languages = [];
    if (Reaction.Subscriptions.Shops.ready()) {
      let shop = Shops.findOne();
      if (typeof shop === "object" && shop.languages) {
        for (let language of shop.languages) {
          if (language.enabled === true) {
            language.translation = "languages." + language.label.toLowerCase();
            languages.push(language);
          }
        }
        if (languages.length > 1) {
          return languages;
        }
      }
    }
  },
  active() {
    if (Session.equals("language", this.i18n)) {
      return "active";
    }
  }
});

/**
 * i18nChooser events
 */

Template.i18nChooser.events({
  "click .i18n-language"(event) {
    event.preventDefault();
    return Session.set("language", this.i18n);
  }
});
