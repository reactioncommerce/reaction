import getNavigationItemContentForLanguage from "../util/getNavigationItemContentForLanguage.js";

/**
 * @name xformNavigationTreeItem
 * @summary Loads full navigation items documents for items in a navigation tree
 * @param {Object} context An object containing the per-request state
 * @param {Object} language Language to filter items by
 * @param {Object} item Object within navigationTree.items array
 * @returns {Object} Object with navigationItem and items properties
 */
export default async function xformNavigationTreeItem(context, language, item) {
  const { collections } = context;
  const { NavigationItems } = collections;
  const { expanded, isVisible, isPrivate, isSecondary, navigationItemId } = item;
  let { items = [] } = item;

  const navigationItem = await NavigationItems.findOne({ _id: navigationItemId });

  // Add translated content value
  const { draftData, data } = navigationItem;
  const { content: draftContent } = draftData || {};
  const { content } = data;
  if (draftContent) {
    navigationItem.draftData.contentForLanguage = getNavigationItemContentForLanguage(draftContent, language);
  }
  if (content) {
    navigationItem.data.contentForLanguage = getNavigationItemContentForLanguage(content, language);
  }

  if (items.length) {
    items = items.map((childItem) => xformNavigationTreeItem(context, language, childItem));
  }

  return {
    navigationItem,
    expanded,
    isVisible,
    isPrivate,
    isSecondary,
    items
  };
}
