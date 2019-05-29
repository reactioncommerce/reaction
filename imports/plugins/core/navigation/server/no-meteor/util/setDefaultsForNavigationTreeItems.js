// Fallback options setting every value to false.
// This effectively means the item will not be published to the public API.
const standardDefaults = {
  shouldNavigationTreeItemsBeAdminOnly: false,
  shouldNavigationTreeItemsBeSecondaryNavOnly: false,
  shouldNavigationTreeItemsBePublicallyVisible: false
};

/**
 * @name setDefaultsForNavigationTreeItems
 * @summary Recursively sets any optional values in the navigation tree with sane defaults
 * @param {Array} items Navigation tree items
 * @param {Object} defaultValues Navigation tree items
 * @return {Array} Navigation tree items
 */
export default function setDefaultsForNavigationTreeItems(items = [], defaultValues = {}) {
  const {
    shouldNavigationTreeItemsBeAdminOnly,
    shouldNavigationTreeItemsBeSecondaryNavOnly,
    shouldNavigationTreeItemsBePublicallyVisible
  } = {
    ...standardDefaults,
    ...defaultValues
  };

  return items.map((node) => {
    const { isVisible, isPrivate, isSecondary } = node;

    // Set defaults for fields that are optional in the GraphQL schema
    // but may be required by SimpleSchema for the database collection.
    // This allows a user to send vastly less data down the wire, but still get sane
    // defaults for various visibility options.
    const newNode = {
      ...node,
      isPrivate: typeof isPrivate === "boolean" ? isPrivate : shouldNavigationTreeItemsBeAdminOnly,
      isSecondary: typeof isSecondary === "boolean" ? isSecondary : shouldNavigationTreeItemsBeSecondaryNavOnly,
      isVisible: typeof isVisible === "boolean" ? isVisible : shouldNavigationTreeItemsBePublicallyVisible
    };

    // Check children recursively
    if (Array.isArray(node.items) && node.items.length) {
      newNode.items = setDefaultsForNavigationTreeItems(node.items, defaultValues);
    }

    return newNode;
  });
}
