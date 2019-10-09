/**
 * @name getNavigationItemContentForLanguage
 * @summary Returns translated navigation item content
 * @param {Array} content Navigation item's data or draftData content
 * @param {String} language Language
 * @returns {String} Translated navigation item content, or first navigation item content if translation in
 *  provided language is not available.
 */
export default function getNavigationItemContentForLanguage(content, language) {
  const translatedContent = content.find((contentItem) => contentItem.language === language);
  if (translatedContent) {
    return translatedContent.value;
  }
  return content[0].value || "";
}
