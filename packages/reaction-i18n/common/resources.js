fetchTranslationResources = () => {
  // fetch reaction translations
  let translations = ReactionCore.Collections.Translations
    .find({}, {
      fields: {
        _id: 0
      }
    }).fetch();
  // map reduce translations into i18next formatting
  const resources = translations.reduce(function (x, y) {
    const ns = Object.keys(y.translation)[0];
    // first creating the structure, when add additional namespaces
    if (x[y.i18n]) {
      x[y.i18n][ns] = y.translation[ns];
    } else {
      x[y.i18n] = y.translation;
    }
    return x;
  }, {});
  return resources;
}
