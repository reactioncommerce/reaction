import i18next from "i18next";
import { Logger } from "/server/api";

/**
 * renderReactionEmail - Returns a rendered and translated
 * email template.
 * @param {String} template name of the template
 * @param {String} lng language of the email text
 * @param {String} data data context for rendering
 * @param {String} fallbackLng language that is used if lng has no translations
 * @returns {Object} returns rendered HTML mail
 */
export function renderReactionEmail(template, lng, data, fallbackLng) {
  check(template, String);
  check(lng, String);
  check(data, Match.Optional(Object));
  check(fallbackLng, Match.Optional(String));

  let fallbackLngs;
  if (typeof(fallbackLng) === "undefined") {
    fallbackLngs = "en";
  } else if (fallbackLng !== "en") {
    // also add english as second fallback..
    fallbackLngs = [fallbackLng, "en"];
  }

  if (!Template[template]) {
    Logger.error(`Template '${ template }' does not exist. ` +
      `Did you register it in the approriate workflow step (register.js)?`);
  }
  Template[template].helpers({
    _: function (key) {
      // I don't know where the last argument comes from...
      let slice = Array.prototype.slice.call(arguments, 1, -1);
      if (slice.length === 2 && typeof(slice[1]) === "object") {
        slice = slice[1];
      }
      const options = {
        postProcess: "sprintf",
        sprintf: slice,
        lng: lng,
        fallbackLng: fallbackLngs
      };
      return Spacebars.SafeString(i18next.t(key, options));
    }
  });

  return SSR.render(template, data);
}
