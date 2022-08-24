/**
 * @name filterNavigationTreeItems
 * @summary Recursively navigation and filters out navigation items based on options provided
 * @param {Array} items Navigation tree items
 * @param {Object} options Filter options
 * @param {Boolean} [options.isAdmin] Filter by admin rights
 * @param {Boolean} [options.shouldIncludeSecondary] Include secondary items
 * @returns {Array} Navigation tree items
 */
export default function filterNavigationTreeItems(items = [], { isAdmin = false, shouldIncludeSecondary = false } = {}) {
  return items.map((node) => {
    const { isVisible, isPrivate, isSecondary } = node;

    // Hide items that are strictly not visible
    if (isVisible === false) {
      return null;
    }

    // Hide private items unless requested
    if (isPrivate && !isAdmin) {
      return null;
    }

    // Exclude secondary items unless requested
    if (isSecondary && shouldIncludeSecondary !== true) {
      return null;
    }

    // Copy node before mutating
    const newNode = { ...node };

    // Check children recursively
    if (Array.isArray(node.items) && node.items.length) {
      newNode.items = filterNavigationTreeItems(node.items, { isAdmin, shouldIncludeSecondary });
    }

    return newNode;
  }).filter((item) => item !== null);
}
