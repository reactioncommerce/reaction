import _ from "lodash";
import i18next from "i18next";
import i18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import i18nextLocalStorageCache from "i18next-localstorage-cache";
import i18nextSprintfPostProcessor from "i18next-sprintf-postprocessor";
import i18nextJquery from "jquery-i18next";
import { Meteor } from "meteor/meteor";
import { Tracker } from "meteor/tracker";
import { Session } from "meteor/session";
import { SimpleSchema } from "meteor/aldeed:simple-schema";
import { Reaction } from "/client/api";
import { Packages, Shops, Translations } from "/lib/collections";
import * as Schemas from "/lib/collections/schemas";

//
// Reaction i18n Translations, RTL and Currency Exchange Support
//

/**
 * getBrowserLanguage
 * @summary detects device default language
 * @return {String} language code
 */
export function getBrowserLanguage() {
  if (typeof navigator.languages !== "undefined") {
    if (~navigator.languages[0].indexOf("-")) {
      return navigator.languages[0].split("-")[0];
    } else if (~navigator.languages[0].indexOf("_")) {
      return navigator.languages[0].split("_")[0];
    }
    return navigator.languages[0];
  }
  return navigator.language || navigator.browserLanguage;
}

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
    const i18nKey = name.charAt(0).toLowerCase() + name.slice(1) + "." +
      fieldName
      .split(".$").join("");
    // translate autoform label
    const t = i18next.t(i18nKey);
    if (new RegExp("string").test(t) !== true && t !== i18nKey) {
      if (t) {
        labels[fieldName] = t;
      }
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
      const i18nKey = `globalMessages.${message}`;
      const t = i18next.t(i18nKey);
      if (new RegExp("string").test(t) !== true && t !== i18nKey) {
        messages[message] = t;
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
export const i18nextDep = new Tracker.Dependency();
export const localeDep = new Tracker.Dependency();
const packageNamespaces = [];

Meteor.startup(() => {
  Tracker.autorun(function (c) {
    if (Reaction.Subscriptions.Shops.ready()) {
      // TODO: i18nextBrowserLanguageDetector
      // const defaultLanguage = lng.detect() || shop.language;

      // set default session language
      Session.setDefault("language", getBrowserLanguage());

      // every package gets a namespace, fetch them
      // const packageNamespaces = [];
      const packages = Packages.find({}, {
        fields: {
          name: 1
        }
      }).fetch();
      for (const pkg of packages) {
        packageNamespaces.push(pkg.name);
      }

      // use i18n detected language to getLocale info
      Meteor.call("shop/getLocale", (error, result) => {
        if (result) {
          const locale = result;
          locale.language = getBrowserLanguage();
          moment.locale(locale.language);
          Reaction.Locale.set(locale);
          localeDep.changed();

          // Stop the tracker
          c.stop();
        }
      });
    }
  });
});

// use tracker autorun to detect language changes
Tracker.autorun(function () {
  return Meteor.subscribe("Translations", Session.get("language"), () => {
    // fetch reaction translations
    const translations = Translations.find({}, {
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

    const shop = Shops.findOne(Reaction.getShopId());

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
        fallbackLng: shop ? shop.language : null, // Shop language
        resources: resources
          // saveMissing: true,
          // missingKeyHandler: function (lng, ns, key, fallbackValue) {
          //   Meteor.call("i18n/addTranslation", lng, ns, key, fallbackValue);
          // }
      }, (err, t) => {
        // someday this should work
        // see: https://github.com/aldeed/meteor-simple-schema/issues/494
        for (let schema in _.omit(Schemas, "__esModule")) {
          if ({}.hasOwnProperty.call(Schemas, schema)) {
            let ss = Schemas[schema];
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

export default i18next;
