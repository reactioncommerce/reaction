
/**
 * @summary Store a shop in the import buffer.
 * @param {Object} key A key to look up the shop
 * @param {Object} shop The shop data to be updated
 * @returns {Object} this shop
 */
ReactionImport.shop = function (key, shop) {
  let json;

  shop.languages = shop.languages || [{
    i18n: "en"
  }];
  for (let language of shop.languages) {
    json = Assets.getText("private/data/i18n/" + language.i18n + ".json");
    this.process(json, ["i18n"], ReactionImport.translation);
  }
  return this.object(ReactionCore.Collections.Shops, key, shop);
};
