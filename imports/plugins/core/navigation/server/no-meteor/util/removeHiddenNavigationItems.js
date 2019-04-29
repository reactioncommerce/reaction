/**
 * @name removeHiddenNavigationItems
 * @summary Recursively removes navigation tree items that are not visible
 * @param {Array} items Navigation tree items
 * @return {Array} Navigation tree items
 */
export default function removeHiddenNavigationItems(items = []) {
  return items.map((node) => {
    if (node.isVisible === false) {
      return null;
    }

    // Copy node
    const newNode = { ...node };

    // Check children
    if (Array.isArray(node.items) && node.items.length) {
      newNode.items = removeHiddenNavigationItems(node.items);
    }

    return newNode;
  }).filter((item) => item !== null);
}
