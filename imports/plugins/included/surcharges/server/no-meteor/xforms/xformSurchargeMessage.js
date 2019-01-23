import getSurchargeMessageForLanguage from "../util/getSurchargeMessageForLanguage";

/**
 * @name xformSurchargeMessage
 * @summary Loads full navigation items documents for items in a navigation tree
 * @param {String} language Language to filter items by
 * @param {Array} messagesByLanguage Array to check language against
 * @return {String} Translated message to return to client
 */
export default async function xformSurchargeMessage(language, messagesByLanguage) {
  const translatedMessage = getSurchargeMessageForLanguage(language, messagesByLanguage);
  return translatedMessage;
}
