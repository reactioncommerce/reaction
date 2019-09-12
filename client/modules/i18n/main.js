import i18next from "i18next";
import { values } from "lodash";
import SimpleSchema from "simpl-schema";
import { Tracker } from "meteor/tracker";

/**
 * @file **Internationalization**
 * Methods and template helpers for i18n, translations, right-to-left (RTL) and currency exchange support
 * @namespace i18n
 */

/**
 * @name getLabelsFor
 * @method
 * @memberof i18n
 * @summary Get Labels for simple.schema keys
 * @param  {Object} schema - schema
 * @param  {String} name - name
 * @returns {Object} return schema label object
 */
export function getLabelsFor(schema, name) {
  const titleCaseName = name.charAt(0).toLowerCase() + name.slice(1);
  const labels = {};
  // loop through all the rendered form fields and generate i18n keys
  Object.keys(schema.mergedSchema()).forEach((fieldName) => {
    const i18nKey = `${titleCaseName}.${fieldName.split(".$").join("")}`;
    // translate autoform label
    const translation = i18next.t(i18nKey);
    if (translation && new RegExp("string").test(translation) !== true && translation !== i18nKey) {
      labels[fieldName] = translation;
    }
  });
  return labels;
}

/**
 * @name getValidationErrorMessages
 * @method
 * @memberof i18n
 * @summary Get i18n messages for autoform messages. Currently using a globalMessage namespace only.
 * 1. Use schema-specific message for specific key
 * 2. Use schema-specific message for generic key
 * 3. Use schema-specific message for type
 * @todo Implement messaging hierarchy from simple-schema
 * @returns {Object} returns i18n translated message for schema labels
 */
export function getValidationErrorMessages() {
  const messages = {};
  values(SimpleSchema.ErrorTypes).forEach((errorType) => {
    const i18nKey = `globalMessages.${errorType}`;
    const message = i18next.t(i18nKey);
    if (new RegExp("string").test(message) !== true && message !== i18nKey) {
      messages[errorType] = message;
    }
  });
  return messages;
}

// set language and autorun on change of language
// initialize i18n and load data resources for the current language and fallback "EN"
export const i18nextDep = new Tracker.Dependency();

export default i18next;
