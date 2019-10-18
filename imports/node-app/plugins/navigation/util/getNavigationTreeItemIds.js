/**
 * @name getNavigationTreeItemIds
 * @summary Recursively returns the _ids of all items in a navigation tree
 * @param {Array} items Navigation tree's items
 * @returns {Array} Array of _ids
 */
export default function getNavigationTreeItemIds(items) {
  let itemIds = [];

  items.forEach((item) => {
    const { navigationItemId, items: childItems } = item;
    itemIds.push(navigationItemId);
    if (childItems) {
      const childItemIds = getNavigationTreeItemIds(childItems);
      itemIds = [...itemIds, ...childItemIds];
    }
  });

  return itemIds;
}
