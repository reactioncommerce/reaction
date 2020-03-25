/**
 * @name getSurchargeMessageForLanguage
 * @summary Returns translated surcharge message
 * @param {String} language Language to filter items by
 * @param {Array} messagesByLanguage Surcharge messages by language array
 * @returns {String} Translated surcharge message, or first surcharge message if translation in
 *  provided language is not available.
 */
export default function getSurchargeMessageForLanguage(language, messagesByLanguage) {
  const translatedMessage = messagesByLanguage.find((message) => message.language === language);
  return (translatedMessage && translatedMessage.content) || null;
}
