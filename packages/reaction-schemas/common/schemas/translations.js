
/*
* translations schema
* mostly just a blackbox for now
* someday maybe we'll validate the entire schema
* since ui editing for these values are likely
*/

ReactionCore.Schemas.Translation = new SimpleSchema({
  shopId: {
    type: String,
    index: 1,
    autoValue: ReactionCore.shopIdAutoValue,
    label: "Translation ShopId"
  },
  language: {
    type: String
  },
  i18n: {
    type: String,
    index: 1
  },
  translation: {
    type: Object,
    blackbox: true
  }
});
