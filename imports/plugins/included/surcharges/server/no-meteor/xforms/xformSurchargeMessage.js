import getSurchargeMessageForLanguage from "../util/getSurchargeMessageForLanguage";

/**
 * @name xformSurchargeMessage
 * @summary Returns surcharge message in specified language
 * @param {String} language Language to filter items by
 * @param {Array} messagesByLanguage Array to check language against
 * @return {String} Translated message to return to client
 */
export default async function xformSurchargeMessage(language, messagesByLanguage) {
  const translatedMessage = getSurchargeMessageForLanguage(language, messagesByLanguage);
  return translatedMessage;
}
