//
// Reaction i18n Translations, RTL and Currency Exchange Support
//

/**
 * getLang
 * @summary detects device default language
 * @return {String} language code
 */
const getLang = () => {
  if (typeof navigator.languages !== "undefined") {
    if (~navigator.languages[0].indexOf("-")) {
      return navigator.languages[0].split("-")[0];
    } else if (~navigator.languages[0].indexOf("_")) {
      return navigator.languages[0].split("_")[0];
    }
    return navigator.languages[0];
  }
  return navigator.language || navigator.browserLanguage;
};

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
    let translation = i18next.t(i18nKey);
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
      let translation = i18next.t(i18nKey);
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
 *  initialize i18n and load data resources for the current language and fallback "EN"
 *
 */
ReactionCore.translationDependency = this.i18nextDep = new Tracker.Dependency();
this.localeDep = new Tracker.Dependency();
const packageNamespaces = [];
let shopLanguage;
let defaultLanguage;
let packages;

Meteor.startup(() => {
  Tracker.autorun(function () {
    if (ReactionCore.Subscriptions.Shops.ready()) {
      const shop = ReactionCore.Collections.Shops.findOne(ReactionCore.getShopId());
      shopLanguage = shop.language;
      defaultLanguage = shopLanguage;
      // TODO: i18nextBrowserLanguageDetector
      // const defaultLanguage = lng.detect() || shopLanguage;

      // set default session language
      Session.setDefault("language", getLang());

      // every package gets a namespace, fetch them
      // const packageNamespaces = [];
      packages = ReactionCore.Collections.Packages.find({}, {
        fields: {
          name: 1
        }
      }).fetch();
      for (const pkg of packages) {
        packageNamespaces.push(pkg.name);
      }

      // use i18n detected language to getLocale info
      Meteor.call("shop/getLocale", function (error, result) {
        if (result) {
          ReactionCore.Locale = result;
          ReactionCore.Locale.language = Session.get("language");
          moment.locale(ReactionCore.Locale.language);
          localeDep.changed();
        }
      });

      // Stop the tracker
      this.stop();
    }
  });
});

// use tracker autorun to detect language changes
Tracker.autorun(function () {
  return Meteor.subscribe("Translations", Session.get("language"), () => {
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

    //
    // initialize i18next
    //
    i18next
      .use(i18nextBrowserLanguageDetector)
      .use(i18nextLocalStorageCache)
      .use(i18nextSprintfPostProcessor)
      .use(i18nextJquery)
      .init({
        debug: false,
        ns: packageNamespaces, // translation namespace for every package
        defaultNS: "core", // reaction "core" is the default namespace
        lng: Session.get("language"), // user session language
        fallbackLng: shopLanguage, // Shop language
        resources: resources
          // saveMissing: true,
          // missingKeyHandler: function (lng, ns, key, fallbackValue) {
          //   Meteor.call("i18n/addTranslation", lng, ns, key, fallbackValue);
          // }
      }, (err, t) => {
        // someday this should work
        // see: https://github.com/aldeed/meteor-simple-schema/issues/494
        for (let schema in ReactionCore.Schemas) {
          if ({}.hasOwnProperty.call(ReactionCore.Schemas, schema)) {
            let ss = ReactionCore.Schemas[schema];
            ss.labels(getLabelsFor(ss, schema));
            ss.messages(getMessagesFor(ss, schema));
          }
        }

        i18nextDep.changed();

        // global first time init event finds and replaces
        // data-i18n attributes in html/template source.
        $elements = $("[data-i18n]").localize();

        // apply language direction to html
        if (t("languageDirection") === "rtl") {
          return $("html").addClass("rtl");
        }
        return $("html").removeClass("rtl");
      });
  });
});

// global onRendered event finds and replaces
// data-i18n attributes in html/template source.
// uses methods from i18nextJquery
Template.onRendered(function () {
  this.autorun((function () {
    return function () {
      i18nextDep.depend();
      $elements = $("[data-i18n]").localize();
    };
  })(this));
});

//
// init i18nextJquery
//
i18nextJquery.init(i18next, $, {
  tName: "t", // --> appends $.t = i18next.t
  i18nName: "i18n", // --> appends $.i18n = i18next
  handleName: "localize", // --> appends $(selector).localize(opts);
  selectorAttr: "data-i18n", // selector for translating elements
  targetAttr: "data-i18n-target", // element attribute to grab target element to translate (if diffrent then itself)
  parseDefaultValueFromContent: true // parses default values from content ele.val or ele.text
});
