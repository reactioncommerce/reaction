import { Reaction } from "/client/api";
import { Shops } from "/lib/collections";
import { Session } from "meteor/session";
import { i18nextDep } from "../../main";
/**
 * i18nChooser helpers
 */

Template.i18nChooser.helpers({
  languages() {
    const languages = [];
    if (Reaction.Subscriptions.Shops.ready()) {
      const shop = Shops.findOne();
      if (typeof shop === "object" && shop.languages) {
        for (const language of shop.languages) {
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
    return languages;
  },
  active() {
    if (Session.equals("language", this.i18n)) {
      return "active";
    }
    return "";
  }
});

/**
 * i18nChooser events
 */

Template.i18nChooser.events({
  "click .i18n-language"(event) {
    event.preventDefault();
    //
    // this is a sanctioned use of Meteor.user.update
    //
    // console.log("this.i18n", this.i18n)
    Meteor.users.update(Meteor.userId(), {$set: {"profile.lang": this.i18n}});

    return Session.set("language", this.i18n);
  }
});
