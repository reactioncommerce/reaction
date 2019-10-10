import { decodeNavigationItemOpaqueId } from "../xforms/id.js";

/**
 * @name decodeNavigationTreeItemIds
 * @summary Recursively decodes opaque _ids for items in a navigation tree
 * @param {Array} items Navigation tree items
 * @returns {Undefined} Directly mutates items
 */
export default function decodeNavigationTreeItemIds(items) {
  items.forEach((item) => {
    const { navigationItemId, items: childItems } = item;
    item.navigationItemId = decodeNavigationItemOpaqueId(navigationItemId);
    if (childItems) {
      decodeNavigationTreeItemIds(childItems);
    }
  });
}
