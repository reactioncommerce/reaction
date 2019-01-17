/**
 * @name getSurchargeMessageInShopLanguage
 * @summary Returns translated surcharge message
 * @param {String} language Language to filter items by
 * @param {Array} message Surcharge message array
 * @return {String} Translated surcharge message, or first surcharge message if translation in
 *  provided language is not available.
 */
export default function getSurchargeMessageInShopLanguage(language, message) {
  const translatedMessage = message.find((messageItem) => messageItem.language === language);
  if (translatedMessage) {
    return translatedMessage.content;
  }
  return message[0].content || "";
}
