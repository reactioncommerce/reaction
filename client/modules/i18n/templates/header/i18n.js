import { Reaction } from "/client/api";
import { Shops } from "/lib/collections";
/**
 * i18nChooser helpers
 */

Template.i18nChooser.helpers({
  languages() {
    const languages = [];
    if (Reaction.Subscriptions.Shops.ready() && Meteor.user()) {
      const shop = Shops.findOne();
      if (typeof shop === "object" && shop.languages) {
        for (const language of shop.languages) {
          if (language.enabled === true) {
            language.translation = "languages." + language.label.toLowerCase();
            // appending a helper to let us know this
            // language is currently selected
            const profile = Meteor.user().profile;
            if (profile && profile.lang) {
              if (profile.lang === language.i18n) {
                language.class = "active";
              }
            } else if (shop.language === language.i18n) {
              // we don't have a profile language
              // use the shop default
              language.class = "active";
            }
            languages.push(language);
          }
        }
        if (languages.length > 1) {
          return languages;
        }
      }
    }
    if (languages.length > 1) {
      return languages;
    }
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
    // and only possible because we allow it in the
    // UserProfile and ShopMembers publications.
    //
    Meteor.users.update(Meteor.userId(), { $set: { "profile.lang": this.i18n } });
  }
});
