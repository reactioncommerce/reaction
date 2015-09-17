
/**
*
* get i18n messages for  updating autoform labels from simple schema
*
*/


var getLabelsFor, getMessagesFor;

getLabelsFor = function(schema, name) {
  var fieldName, i18n_key, labels, translation, _i, _len, _ref;
  labels = {};
  _ref = schema._schemaKeys;
  //loop through all the rendered form fields and generate i18n keys
  for (_i = 0, _len = _ref.length; _i < _len; _i++) {
    fieldName = _ref[_i];

    i18n_key = name.charAt(0).toLowerCase() + name.slice(1) + "." + fieldName.split(".$").join("");
    translation = i18n.t(i18n_key);

    if (new RegExp('string').test(translation) !== true && translation !== i18n_key) {
      if (translation) labels[fieldName] = translation;
    }
  }
  return labels;
};


/**
 * get i18n messages for autoform messages
 * currently using a globalMessage namespace only
 *
 * TODO: implement messaging hierarchy from simple-schema
 *
 * (1) Use schema-specific message for specific key
 * (2) Use schema-specific message for generic key
 * (3) Use schema-specific message for type
 *
 */

getMessagesFor = function(schema, name) {
  var i18n_key, message, messages, translation;
  messages = {};
  for (message in SimpleSchema._globalMessages) {
    i18n_key = "globalMessages" + "." + message;
    translation = i18n.t(i18n_key);
    if (new RegExp('string').test(translation) !== true && translation !== i18n_key) {
      messages[message] = translation;
    }
  }
  return messages;
};


/**
 *  set language and autorun on change of language
 *  initialize i18n and load data resources for the current language and fallback 'EN'
 *
 */

this.i18nextDep = new Tracker.Dependency();

this.localeDep = new Tracker.Dependency();

Meteor.startup(function() {
  Session.set("language", i18n.detectLanguage());
  Meteor.call('getLocale', function(error, result) {
    if (result) {
      ReactionCore.Locale = result;
      ReactionCore.Locale.language = Session.get("language");
      moment.locale(ReactionCore.Locale.language);
      localeDep.changed();
    }
  });
  Tracker.autorun(function() {
    ReactionCore.Locale.language = Session.get("language");
    return Meteor.subscribe("Translations", ReactionCore.Locale.language, function() {
      var resources;
      resources = ReactionCore.Collections.Translations.find({}, {
        fields: {
          _id: 0
        },
        reactive: false
      }).fetch();
      resources = resources.reduce(function(x, y) {
        x[y.i18n] = y.translation;
        return x;
      }, {});
      return $.i18n.init({
        lng: ReactionCore.Locale.language,
        fallbackLng: 'en',
        ns: "core",
        resStore: resources
      }, function() {
        var schema, ss, _ref;
        _ref = ReactionCore.Schemas;
        for (schema in _ref) {
          ss = _ref[schema];
          ss.labels(getLabelsFor(ss, schema));
          ss.messages(getMessagesFor(ss, schema));
        }
        i18nextDep.changed();
        if ($.t('languageDirection') === 'rtl') {
          return $('html').addClass('rtl');
        } else {
          return $('html').removeClass('rtl');
        }
      });
    });
  });
  Template.onRendered(function() {
    this.autorun((function(_this) {
      return function() {
        var $elements;
        i18nextDep.depend();
        $elements = _this.$("[data-i18n]");
        if (typeof $elements.i18n === "function") {
          $elements.i18n();
        }
      };
    })(this));
  });
  return Template.onDestroyed(function() {
    i18nextDep.changed();
  });
});


/**
 * i18n helper
 * see: http://i18next.com/
 * pass the translation key as the first argument
 * and the default message as the second argument
 *
 * ex: {{i18n "accountsTemplate.error" "Invalid Email"}}
 */

Template.registerHelper("i18n", function(i18n_key, message) {
  if (!i18n_key) {
    throw new Meteor.Error("i18n key string required to translate");
  }

  check(i18n_key, String);
  i18nextDep.depend();

  message = new Handlebars.SafeString(message);

  if (i18n.t(i18n_key) === i18n_key) {
    ReactionCore.Events.debug("no translation found. returning raw message for:" + i18n_key);
    return message.string;
  } else {
    return i18n.t(i18n_key);
  }
});


/**
 *  return shop /locale specific currency format (ie: $)
 */

Template.registerHelper("currencySymbol", function() {
  return ReactionCore.Locale.currency.symbol;
});


/**
 * return shop /locale specific formatted price
 * also accepts a range formatted with " - "
 */

Template.registerHelper("formatPrice", function(price) {
  var actualPrice, formattedPrice, originalPrice, prices, _i, _len, _ref, _ref1, _ref2, _ref3, _ref4, _ref5, _ref6, _ref7, _ref8;
  localeDep.depend();
  try {
    prices = price.split(' - ');
    for (_i = 0, _len = prices.length; _i < _len; _i++) {
      actualPrice = prices[_i];
      originalPrice = actualPrice;
      if ((_ref = ReactionCore.Locale) != null ? (_ref1 = _ref.currency) != null ? _ref1.exchangeRate : void 0 : void 0) {
        actualPrice = actualPrice * ((_ref2 = ReactionCore.Locale) != null ? (_ref3 = _ref2.currency) != null ? _ref3.exchangeRate.Rate : void 0 : void 0);
      }
      formattedPrice = accounting.formatMoney(actualPrice, ReactionCore.Locale.currency);
      price = price.replace(originalPrice, formattedPrice);
    }
  } catch (_error) {
    if ((_ref4 = ReactionCore.Locale) != null ? (_ref5 = _ref4.currency) != null ? _ref5.exchangeRate : void 0 : void 0) {
      price = price * ((_ref6 = ReactionCore.Locale) != null ? (_ref7 = _ref6.currency) != null ? _ref7.exchangeRate.Rate : void 0 : void 0);
    }
    price = accounting.formatMoney(price, (_ref8 = ReactionCore.Locale) != null ? _ref8.currency : void 0);
  }
  return price;
});
