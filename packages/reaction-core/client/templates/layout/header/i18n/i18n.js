/**
* i18nChooser helpers
*/

Template.i18nChooser.helpers({
  languages: function() {
    var language, languages, shop, _i, _len, _ref;
    languages = [];
    shop = ReactionCore.Collections.Shops.findOne();
    if (shop != null ? shop.languages : void 0) {
      _ref = shop.languages;
      for (_i = 0, _len = _ref.length; _i < _len; _i++) {
        language = _ref[_i];
        if (language.enabled === true) {
          language.translation = "languages." + language.label.toLowercase;
          languages.push(language);
        }
      }
      return languages;
    }
  },
  active: function() {
    if (Session.equals("language", this.i18n)) {
      return "active";
    }
  }
});

/**
* i18nChooser events
*/

Template.i18nChooser.events({
  'click .i18n-language': function(event, template) {
    event.preventDefault();
    return Session.set('language', this.i18n);
  }
});
