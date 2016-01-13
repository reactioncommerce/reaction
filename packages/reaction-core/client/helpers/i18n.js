/*
 * Reaction i18n Translations, RTL and Currency Exchange Support
 */

/**
 * getLabelsFor
 * get Labels for simple.schema keys
 * @param  {Object} schema - schema
 * @param  {String} name - name
 * @return {Object} return schema label object
 */
function getLabelsFor(schema, name) {
  let labels = {};
  // loop through all the rendered form fields and generate i18n keys
  for (let fieldName of schema._schemaKeys) {
    let i18nKey = name.charAt(0).toLowerCase() + name.slice(1) + "." +
      fieldName
      .split(".$").join("");
    // translate autoform label
    let translation = i18n.t(i18nKey);
    if (new RegExp("string").test(translation) !== true && translation !==
      i18nKey) {
      if (translation) labels[fieldName] = translation;
    }
  }
  return labels;
}

/**
 * getMessagesFor
 * get i18n messages for autoform messages
 * currently using a globalMessage namespace only*
 * (1) Use schema-specific message for specific key
 * (2) Use schema-specific message for generic key
 * (3) Use schema-specific message for type
 * @todo implement messaging hierarchy from simple-schema
 * @return {Object} returns i18n translated message for schema labels
 */
function getMessagesFor() {
  let messages = {};
  for (let message in SimpleSchema._globalMessages) {
    if ({}.hasOwnProperty.call(SimpleSchema._globalMessages, message)) {
      let i18nKey = `globalMessages.${message}`;
      let translation = i18n.t(i18nKey);
      if (new RegExp("string").test(translation) !== true && translation !==
        i18nKey) {
        messages[message] = translation;
      }
    }
  }
  return messages;
}

/**
 *  set language and autorun on change of language
 *  initialize i18n and load data resources for the current language and fallback 'EN'
 *
 */

this.i18nextDep = new Tracker.Dependency();

this.localeDep = new Tracker.Dependency();

Meteor.startup(function () {
  // i18nNext detectLanguage
  Session.set("language", i18n.detectLanguage());
  // use i18n detected language to getLocale info
  Meteor.call("shop/getLocale", function (error, result) {
    if (result) {
      ReactionCore.Locale = result;
      ReactionCore.Locale.language = Session.get("language");
      moment.locale(ReactionCore.Locale.language);
      localeDep.changed();
    }
  });
  // use tracker autorun to detect language changes
  Tracker.autorun(function () {
    ReactionCore.Locale.language = Session.get("language");
    return Meteor.subscribe("Translations", ReactionCore.Locale.language,
      function () {
        // fetch reaction translations
        let reactionTranslations = ReactionCore.Collections.Translations
          .find({}, {
            fields: {
              _id: 0
            },
            reactive: false
          }).fetch();
        // map reduce translations into i18next formatting
        let resources = reactionTranslations.reduce(function (x, y) {
          x[y.i18n] = y.translation;
          return x;
        }, {});
        // initialize i18next
        return $.i18n.init({
          lng: ReactionCore.Locale.language,
          fallbackLng: "en",
          ns: "core",
          resStore: resources
        }, function () {
          for (let schema in ReactionCore.Schemas) {
            if ({}.hasOwnProperty.call(ReactionCore.Schemas,
                schema)) {
              let ss = ReactionCore.Schemas[schema];
              ss.labels(getLabelsFor(ss, schema));
              ss.messages(getMessagesFor(ss, schema));
            }
          }
          // trigger dependency change
          i18nextDep.changed();
          // apply language direction to html
          if ($.t("languageDirection") === "rtl") {
            return $("html").addClass("rtl");
          }
          return $("html").removeClass("rtl");
        });
      });
  });

  // global onRendered event finds and replaces
  // data-i18n attributes in html/template source.
  Template.onRendered(function () {
    this.autorun((function (_this) {
      return function () {
        let $elements;
        i18nextDep.depend();
        $elements = _this.$("[data-i18n]");
        if (typeof $elements.i18n === "function") {
          $elements.i18n();
        }
      };
    })(this));
  });
  return Template.onDestroyed(function () {
    i18nextDep.changed();
  });
});

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

  i18nextDep.depend();

  let message = new Handlebars.SafeString(i18nMessage);

  if (i18n.t(i18nKey) === i18nKey) {
    ReactionCore.Log.debug(
      `i18n: no translation found. returning raw message for: ${i18nKey}`
    );
    return message.string;
  }
  return i18n.t(i18nKey);
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
Template.registerHelper("formatPrice", function (currentPrice) {
  const { Locale } = ReactionCore;
  localeDep.depend();

  if (typeof Locale !== "object" || typeof Locale.currency !== "object") {
    // locale not yet loaded, so we don't need to return anything.
    return false;
  }

  if (typeof currentPrice !== "string" && typeof currentPrice !== "number") {
    return false;
  }

  // for the cases then we have only one price. It is a number.
  currentPrice = currentPrice.toString();
  let price = 0;
  const prices = ~currentPrice.indexOf(" - ") ?
    currentPrice.split(" - ") :
    [currentPrice];

  // basic "for" is faster then "for ...of" for arrays. We need more speed here
  const len = prices.length;
  for (let i = 0; i < len; i++) {
    let originalPrice = prices[i];
    try {
      // we know the locale, but we don't know exchange rate. In that case we
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
  let format = Object.assign({}, ReactionCore.Locale.currency, {format: "%v"});
  let shopFormat = Object.assign({}, ReactionCore.Locale.shopCurrency,
    {format: "%v"});
  const { Locale } = ReactionCore;

  if (typeof Locale.currency === "object" && Locale.currency.rate) {
    price = currentPrice * ReactionCore.Locale.currency.rate;
    return accounting.formatMoney(price, format);
  }

  ReactionCore.Log.debug("currency error, fallback to shop currency");
  return accounting.formatMoney(currentPrice, shopFormat);
};

/**
 * @private
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
    let modifiedCurrency = Object.assign({}, currency, { symbol: "" });
    formattedPrice = accounting.formatMoney(actualPrice, modifiedCurrency);
  } else {
    // accounting api: http://openexchangerates.github.io/accounting.js/
    formattedPrice = accounting.formatMoney(actualPrice, currency);
  }

  return (price === 0 ? currentPrice.replace(originalPrice, formattedPrice) :
    price.replace(originalPrice, formattedPrice));
}