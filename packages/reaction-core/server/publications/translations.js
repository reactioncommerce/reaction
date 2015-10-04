/**
 * i18n - translations
 * @params {String} sessionLanguage - current sessionLanguage default to 'en'
 */
Meteor.publish("Translations", function (sessionLanguage) {
  check(sessionLanguage, String);
  return ReactionCore.Collections.Translations.find({
    $or: [{
      i18n: "en"
    }, {
      i18n: sessionLanguage
    }]
  });
});
