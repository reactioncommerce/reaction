/**
 * @name getNavigationItemContentForLanguage
 * @summary Filters a navigation item's content array down to a single language. If not found,
 *  defaults to first element in content array.
 * @param {Array} content Navigation item's data or draftData content
 * @param {String} language Language to filter by
 * @return {Array} Array containing a single content translation object
 */
export default function getNavigationItemContentForLanguage(content, language) {
  const translatedContent = content.find((contentItem) => contentItem.language === language);
  if (translatedContent) {
    return [translatedContent];
  }
  return [content[0]];
}
