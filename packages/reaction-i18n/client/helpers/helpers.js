/**
 * i18n
 * see: http://i18next.com/
 * pass the translation key as the first argument
 * and the default message as the second argument
 * @param {String} i18nKey - i18nKey
 * @param {String} i18nMessage - message text
 * @example {{i18n "accountsTemplate.error" "Invalid Email"}}
 * @return {String} returns i18n translated message
 */
Template.registerHelper("i18n", function (i18nKey, i18nMessage) {
  if (!i18nKey || typeof i18nMessage !== "string") {
    ReactionCore.Log.info("i18n key string required to translate", i18nKey, i18nMessage);
    return "";
  }
  check(i18nKey, String);
  check(i18nMessage, String);

  // i18nextDep.depend();
  let message = new Handlebars.SafeString(i18nMessage);
  // returning translated key
  return i18next.t(i18nKey, {defaultValue: message});
});

/**
 * currencySymbol
 * @summary return shop /locale specific currency format (ie: $)
 * @returns {String} return current locale currency symbol
 */
Template.registerHelper("currencySymbol", function () {
  return ReactionCore.Locale.currency.symbol;
});

/**
 * formatPrice
 * @summary return shop /locale specific formatted price
 * also accepts a range formatted with " - "
 * @param {String} currentPrice - currentPrice or "xx.xx - xx.xx" formatted String
 * @return {String} returns locale formatted and exchange rate converted values
 */
Template.registerHelper("formatPrice", function (formatPrice) {
  const {
    Locale
  } = ReactionCore;
  localeDep.depend();

  if (typeof Locale !== "object" || typeof Locale.currency !== "object") {
    // locale not yet loaded, so we don"t need to return anything.
    return false;
  }

  if (typeof formatPrice !== "string" && typeof formatPrice !== "number") {
    return false;
  }

  // for the cases then we have only one price. It is a number.
  let currentPrice = formatPrice.toString();
  let price = 0;
  const prices = ~currentPrice.indexOf(" - ") ?
    currentPrice.split(" - ") : [currentPrice];

  // basic "for" is faster then "for ...of" for arrays. We need more speed here
  const len = prices.length;
  for (let i = 0; i < len; i++) {
    let originalPrice = prices[i];
    try {
      // we know the locale, but we don"t know exchange rate. In that case we
      // should return to default shop currency
      if (typeof Locale.currency.rate !== "number") {
        throw new Meteor.Error("exchangeRateUndefined");
      }
      prices[i] *= Locale.currency.rate;

      price = _formatPrice(price, originalPrice, prices[i],
        currentPrice, Locale.currency, i, len);
    } catch (error) {
      ReactionCore.Log.debug("currency error, fallback to shop currency");
      price = _formatPrice(price, originalPrice, prices[i],
        currentPrice, Locale.shopCurrency, i, len);
    }
  }

  return price;
});

ReactionCore.Currency = {};

ReactionCore.Currency.formatNumber = function (currentPrice) {
  let price = currentPrice;
  let format = Object.assign({}, ReactionCore.Locale.currency, {
    format: "%v"
  });
  let shopFormat = Object.assign({}, ReactionCore.Locale.shopCurrency, {
    format: "%v"
  });
  const {
    Locale
  } = ReactionCore;

  if (typeof Locale.currency === "object" && Locale.currency.rate) {
    price = currentPrice * ReactionCore.Locale.currency.rate;
    return accounting.formatMoney(price, format);
  }

  ReactionCore.Log.debug("currency error, fallback to shop currency");
  return accounting.formatMoney(currentPrice, shopFormat);
};

/**
 * _formatPrice
 * private function for formatting locale currency
 * @private
 * @param  {Number} price         price
 * @param  {Number} originalPrice originalPrice
 * @param  {Number} actualPrice   actualPrice
 * @param  {Number} currentPrice  currentPrice
 * @param  {Number} currency      currency
 * @param  {Number} pos           position
 * @param  {Number} len           length
 * @return {Number}               formatted price
 */
function _formatPrice(price, originalPrice, actualPrice, currentPrice, currency,
  pos, len) {
  // this checking for Locale.shopCurrency mostly
  if (typeof currency !== "object") {
    return false;
  }
  let formattedPrice;
  // @param {string} currency.where: If it presents - in situation then two
  // prices in string, currency sign will be placed just outside the right price.
  // For now it should be manually added to fixtures shop data.
  if (typeof currency.where === "string" && currency.where === "right" &&
    len > 1 && pos === 0) {
    let modifiedCurrency = Object.assign({}, currency, {
      symbol: ""
    });
    formattedPrice = accounting.formatMoney(actualPrice, modifiedCurrency);
  } else {
    // accounting api: http://openexchangerates.github.io/accounting.js/
    formattedPrice = accounting.formatMoney(actualPrice, currency);
  }

  return price === 0 ? currentPrice.replace(originalPrice, formattedPrice) : price.replace(originalPrice, formattedPrice);
}

Object.assign(ReactionCore, {
  /**
   * translateRegistry
   * @summary added i18n strings to registry
   * @param {Object} registry  registry object
   * @param {Object} [app] app object. It contains registries
   * @return {Object} with updated registry
   */
  translateRegistry(registry, app) {
    let registryLabel = "";
    let i18nKey = "";
    // first we check the default place for a label
    if (registry.label) {
      registryLabel = registry.label.toCamelCase();
      i18nKey = `admin.${registry.provides}.${registryLabel}`;
      // and if we don"t find it, we are trying to look at first
      // registry entry
    } else if (app && app.registry && app.registry.length &&
      app.registry[0].label) {
      registryLabel = app.registry[0].label.toCamelCase();
      i18nKey = `admin.${app.registry[0].provides}.${registryLabel}`;
    }
    registry.i18nKeyLabel = `${i18nKey}Label`;
    registry.i18nKeyDescription = `${i18nKey}Description`;
    registry.i18nKeyPlaceholder = `${i18nKey}Placeholder`;
    registry.i18nKeyTooltip = `${i18nKey}Tooltip`;

    return registry;
  }
});
