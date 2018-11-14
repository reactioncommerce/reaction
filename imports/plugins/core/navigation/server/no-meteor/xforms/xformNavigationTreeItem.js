/**
 * @name xformNavigationTreeItem
 * @summary Loads full navigation items documents for items in a navigation tree
 * @param {Object} context An object containing the per-request state
 * @param {Object} item Object within navigationTree.items array
 * @return {Object} Object with navigationItem and items properties
 */
export default async function xformNavigationTreeItem(context, item) {
  const { collections } = context;
  const { NavigationItems } = collections;
  const { navigationItemId, items = [] } = item;

  const navigationItem = await NavigationItems.findOne({ _id: navigationItemId });

  if (items.length) {
    items = items.map((childItem) => xformNavigationTreeItem(childItem));
  }

  return {
    navigationItem,
    items
  };
}
