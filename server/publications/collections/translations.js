import { Meteor } from "meteor/meteor";
import { check, Match } from "meteor/check";
import { Shops, Translations } from "/lib/collections";
import { Reaction } from "/server/api";

/**
* @file Translations publication
*
*
* @module Translations
*/

/**
 * Translations publication
 * @param {String|Array} sessionLanguages - String or array of langauges. current sessionLanguage, default to 'en'
 * @returns { Object } returns Translations
 * @todo like to see the langages validated more with a schema
 */
Meteor.publish("Translations", (languages) => {
  check(languages, Match.OneOf(String, Array));
  const shopId = Reaction.getShopId();
  const shopLanguage = Shops.findOne(shopId).language;
  const sessionLanguages = [];
  const langTranQuery = [];

  // set shop default
  sessionLanguages.push(shopLanguage);
  // lets get all these langauges
  if (Array.isArray(languages)) {
    sessionLanguages.concat(languages);
  } else {
    sessionLanguages.push(languages);
  }
  // add in the shop filter
  for (const sessionLanguage of sessionLanguages) {
    langTranQuery.push({
      i18n: sessionLanguage,
      shopId: Reaction.getPrimaryShopId()
    });
  }

  return Translations.find({
    $or: langTranQuery
  });
});
