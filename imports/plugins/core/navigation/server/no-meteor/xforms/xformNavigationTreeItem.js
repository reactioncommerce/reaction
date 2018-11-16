import getNavigationItemContentForLanguage from "../util/getNavigationItemContentForLanguage";

/**
 * @name xformNavigationTreeItem
 * @summary Loads full navigation items documents for items in a navigation tree
 * @param {Object} context An object containing the per-request state
 * @param {Object} language Language to filter items by
 * @param {Object} item Object within navigationTree.items array
 * @return {Object} Object with navigationItem and items properties
 */
export default async function xformNavigationTreeItem(context, language, item) {
  const { collections } = context;
  const { NavigationItems } = collections;
  const { navigationItemId } = item;
  let { items = [] } = item;

  const navigationItem = await NavigationItems.findOne({ _id: navigationItemId });

  // Filter navigation content by language
  const { draftData, data } = navigationItem;
  const { content: draftContent } = draftData || {};
  const { content } = data;
  if (draftContent) {
    navigationItem.draftData.content = getNavigationItemContentForLanguage(draftContent, language);
  }
  if (content) {
    navigationItem.data.content = getNavigationItemContentForLanguage(content, language);
  }

  if (items.length) {
    items = items.map((childItem) => xformNavigationTreeItem(context, language, childItem));
  }

  return {
    navigationItem,
    items
  };
}
