/**
 * i18n - translations
 * @params {String} sessionLanguage - current sessionLanguage default to 'en'
 */
var Translations = ReactionCore.Collections.Translations;

Meteor.publish("Translations", function(sessionLanguage) {
  check(sessionLanguage, String);
  return Translations.find({
    $or: [
      {
        'i18n': 'en'
      }, {
        'i18n': sessionLanguage
      }
    ]
  });
});
