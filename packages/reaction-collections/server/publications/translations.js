/**
 * Translations publication
 * @param {String} sessionLanguage - current sessionLanguage default to 'en'
 */
Meteor.publish("Translations", function (sessionLanguage) {
  check(sessionLanguage, String);
  const shopId = ReactionCore.getShopId();
  const shopLanguage = ReactionCore.Collections.Shops.findOne(ReactionCore.getShopId()).language || "en";
  return ReactionCore.Collections.Translations.find({
    $or: [{
      i18n: shopLanguage,
      shopId: shopId
    }, {
      i18n: sessionLanguage,
      shopId: shopId
    }]
  });
});
