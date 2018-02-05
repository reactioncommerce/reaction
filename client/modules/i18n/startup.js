import i18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import i18nextLocalStorageCache from "i18next-localstorage-cache";
import i18nextSprintfPostProcessor from "i18next-sprintf-postprocessor";
import i18nextJquery from "jquery-i18next";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { $ } from "meteor/jquery";
import { Tracker } from "meteor/tracker";
import { ReactiveVar } from "meteor/reactive-var";
import { Reaction } from "/client/api";
import { Shops, Translations, Packages } from "/lib/collections";
import { getSchemas } from "@reactioncommerce/reaction-collections";
import i18next, { getLabelsFor, getValidationErrorMessages, i18nextDep, currencyDep } from "./main";
import { mergeDeep } from "/lib/api";

//
// setup options for i18nextBrowserLanguageDetector
// note: this isn't fully operational yet
// language is set by user currently
// progress toward detecting language
// should focus around i18nextBrowserLanguageDetector
//
const options = {
  // order and from where user language should be detected
  order: ["querystring", "cookie", "localStorage", "navigator", "htmlTag"],

  // keys or params to lookup language from
  lookupQuerystring: "lng",
  lookupCookie: "i18next",
  lookupLocalStorage: "i18nextLng",

  // cache user language on
  caches: ["localStorage", "cookie"],
  // optional htmlTag with lang attribute, the default is:
  htmlTag: document.documentElement
};

const userProfileLanguage = new ReactiveVar(null);

Meteor.startup(() => {
  // We need to ensure fine-grained reactivity on only the profile.lang because
  // user.profile changed frequently and causes excessive reruns
  Tracker.autorun(() => {
    const userId = Meteor.userId();
    const user = userId && Meteor.users.findOne(userId, { fields: { profile: 1 } });
    userProfileLanguage.set((user && user.profile && user.profile.lang) || null);
  });
  // use tracker autorun to detect language changes
  // this only runs on initial page loaded
  // and when user.profile.lang updates
  Tracker.autorun(() => {
    if (!Reaction.Subscriptions.PrimaryShop.ready() ||
      !Reaction.Subscriptions.MerchantShops.ready()) return;

    // Depend on user.profile.language reactively
    const userLanguage = userProfileLanguage.get();

    // Choose shop to get language from
    let shopId;
    if (Reaction.marketplaceEnabled && Reaction.merchantLanguage) {
      shopId = Reaction.getShopId();
    } else {
      shopId = Reaction.getPrimaryShopId();
    }
    // By specifying "fields", we limit reruns to only when that field changes
    const shop = Shops.findOne({ _id: shopId }, { fields: { language: 1 }, reactive: false });
    const shopLanguage = (shop && shop.language) || null;

    // Use fallbacks to determine the final language
    const language = userLanguage || shopLanguage || "en";

    //
    // subscribe to user + shop Translations
    //
    return Meteor.subscribe("Translations", language, () => {
      // Get the list of packages for that shop
      const packageNamespaces = Packages.find({
        shopId
      }, {
        fields: {
          name: 1
        }
      }).map((pkg) => pkg.name);

      //
      // reduce and merge translations
      // into i18next resource format
      //
      let resources = {};
      Translations.find({}).forEach((translation) => {
        resources = mergeDeep(resources, {
          [translation.i18n]: translation.translation
        });
      });

      //
      // initialize i18next
      //
      i18next
        .use(i18nextBrowserLanguageDetector)
        .use(i18nextLocalStorageCache)
        .use(i18nextSprintfPostProcessor)
        .init({
          detection: options,
          debug: false,
          ns: packageNamespaces, // translation namespace for every package
          defaultNS: "core", // reaction "core" is the default namespace
          fallbackNS: packageNamespaces,
          lng: language,
          fallbackLng: shopLanguage,
          resources
        }, () => {
          // Loop through registered Schemas to change labels and messages
          const Schemas = getSchemas();
          for (const schemaName in Schemas) {
            if ({}.hasOwnProperty.call(Schemas, schemaName)) {
              const schemaInstance = Schemas[schemaName];
              schemaInstance.labels(getLabelsFor(schemaInstance, schemaName));
              schemaInstance.messageBox.messages({
                [language]: getValidationErrorMessages()
              });
              schemaInstance.messageBox.setLanguage(language);
            }
          }

          i18nextDep.changed();

          // global first time init event finds and replaces
          // data-i18n attributes in html/template source.
          $("[data-i18n]").localize();

          // apply language direction to html
          if (i18next.dir(language) === "rtl") {
            return $("html").addClass("rtl");
          }
          return $("html").removeClass("rtl");
        });
    }); // return
  });

  // Detect user currency changes.
  // These two autoruns work together to ensure currencyDep is only considered
  // to be changed when it should be.
  // XXX currencyDep is not used by the main app. Maybe can get rid of this
  // if no add-on packages use it?
  const userCurrency = new ReactiveVar();
  Tracker.autorun(() => {
    // We are using the reactive var only to be sure that currencyDep.changed()
    // is called only when the value is actually changed from the previous value.
    const currency = userCurrency.get();
    if (currency) currencyDep.changed();
  });
  Tracker.autorun(() => {
    const user = Meteor.user();
    if (Reaction.Subscriptions.PrimaryShop.ready() &&
        Reaction.Subscriptions.MerchantShops.ready() &&
        user) {
      userCurrency.set((user.profile && user.profile.currency) || undefined);
    }
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
        $("[data-i18n]").localize();
      };
    })(this));
  });
});
