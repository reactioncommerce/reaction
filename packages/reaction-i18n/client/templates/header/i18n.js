/**
 * i18nChooser helpers
 */

Template.i18nChooser.helpers({
  languages: function () {
    let languages = [];
    if (ReactionCore.Subscriptions.Shops.ready()) {
      let shop = ReactionCore.Collections.Shops.findOne();
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
  active: function () {
    if (Session.equals("language", this.i18n)) {
      return "active";
    }
  }
});

/**
 * i18nChooser events
 */

Template.i18nChooser.events({
  "click .i18n-language": function (event) {
    event.preventDefault();
    return Session.set("language", this.i18n);
  }
});
