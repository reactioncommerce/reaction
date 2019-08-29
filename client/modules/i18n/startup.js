import i18nextBrowserLanguageDetector from "i18next-browser-languagedetector";
import i18nextSprintfPostProcessor from "i18next-sprintf-postprocessor";
import i18nextFetch from "i18next-fetch-backend";
import i18nextMultiLoadBackendAdapter from "i18next-multiload-backend-adapter";
import i18nextJquery from "jquery-i18next";
import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { $ } from "meteor/jquery";
import { Tracker } from "meteor/tracker";
import { Reaction } from "/client/api";
import Logger from "/client/modules/logger";
import { Shops } from "/lib/collections";
import Schemas from "@reactioncommerce/schemas";
import i18next, { getLabelsFor, getValidationErrorMessages, i18nextDep } from "./main";

const configuredI18next = i18next
  // https://github.com/i18next/i18next-browser-languageDetector
  // Sets initial language to load based on `lng` query string
  // with various fallbacks.
  .use(i18nextBrowserLanguageDetector)
  // https://github.com/i18next/i18next-sprintf-postProcessor
  // key: 'Hello %(users[0].name)s, %(users[1].name)s and %(users[2].name)s',
  // i18next.t('key2', { postProcess: 'sprintf', sprintf: { users: [{name: 'Dolly'}, {name: 'Molly'}, {name: 'Polly'}] } });
  // --> 'Hello Dolly, Molly and Polly'
  .use(i18nextSprintfPostProcessor)
  // https://github.com/perrin4869/i18next-fetch-backend
  // This uses `fetch` to load resources from the backend based on `backend`
  // config object below.
  .use(i18nextMultiLoadBackendAdapter);

/**
 * @summary Async function to initialize i18next after we have a fallback
 *   (shop) language.
 * @param {String} fallbackLng Language code to use if i18nextBrowserLanguageDetector fails
 * @return {undefined}
 */
async function initializeI18n(fallbackLng) {
  // Reaction does not have a predefined list of namespaces. Any API plugin can
  // add any namespaces. So we must first get the list of namespaces from the API.
  const namespaceResponse = await fetch("/locales/namespaces.json");
  const allTranslationNamespaces = await namespaceResponse.json();

  try {
    await configuredI18next.init({
      backend: {
        backend: i18nextFetch,
        backendOption: {
          allowMultiLoading: true,
          loadPath: "/locales/resources.json?lng={{lng}}&ns={{ns}}"
        }
      },
      debug: false,
      detection: {
        // We primarily set language according to `navigator.language`,
        // which is supported in all modern browsers and can be changed
        // in the browser settings. This is the same list that browsers
        // send in the `Accept-Language` header.
        //
        // For ease of testing translations, we also support `lng`
        // query string to override the browser setting.
        order: ["querystring", "navigator"]
      },
      ns: allTranslationNamespaces,
      defaultNS: "core", // reaction "core" is the default namespace
      fallbackNS: allTranslationNamespaces,
      fallbackLng
    });
  } catch (error) {
    // We want to log when this happens, but we want to also continue
    // as long as `i18next.language` has been successfully detected
    // so that other language-dependent things work properly.
    Logger.error(error);
    if (!i18next.language) return;
  }

  // i18next.language will now be set to the language detected
  // by i18nextBrowserLanguageDetector, or to fallbackLng.

  // Loop through registered Schemas to change labels and messages
  for (const schemaName in Schemas) {
    if ({}.hasOwnProperty.call(Schemas, schemaName)) {
      const schemaInstance = Schemas[schemaName];
      schemaInstance.labels(getLabelsFor(schemaInstance, schemaName));
      schemaInstance.messageBox.messages({
        [i18next.language]: getValidationErrorMessages()
      });
      schemaInstance.messageBox.setLanguage(i18next.language);
    }
  }


  // apply language direction to html
  if (i18next.dir() === "rtl") {
    $("html").addClass("rtl");
  } else {
    $("html").removeClass("rtl");
  }

  // Causes all Blaze templates and the React TranslationProvider
  // to update to show new translations.
  i18nextDep.changed();
}

Meteor.startup(() => {
  // Autorun only long enough to be sure we have a shop ID
  Tracker.autorun((computation) => {
    const shopId = Reaction.getPrimaryShopId();
    if (!shopId) return; // will reactively rerun after there is a shop ID

    computation.stop();

    const shop = Shops.findOne({ _id: shopId });
    const shopLanguage = (shop && shop.language) || null;

    initializeI18n(shopLanguage || "en");
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
