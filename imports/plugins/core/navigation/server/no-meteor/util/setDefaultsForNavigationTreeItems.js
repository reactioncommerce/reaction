/**
 * @name setDefaultsForNavigationTreeItems
 * @summary Recursively sets any optional values in the navigation tree with sane defaults
 * @param {Array} items Navigation tree items
 * @return {Array} Navigation tree items
 */
export default function setDefaultsForNavigationTreeItems(items = []) {
  return items.map((node) => {
    const { isVisible, isPrivate, isSecondary } = node;

    // Set defaults for fields that are optional in the GraphQL schema
    // but may be required by SimpleSchema for the database collection.
    // This allows a user to send vastly less data down the wire, but still get sane
    // defaults for various visibility options.
    const newNode = {
      ...node,
      isPrivate: typeof isPrivate === "boolean" ? isPrivate : false,
      isSecondary: typeof isSecondary === "boolean" ? isSecondary : false,
      isVisible: typeof isVisible === "boolean" ? isVisible : true
    };

    // Check children recursively
    if (Array.isArray(node.items) && node.items.length) {
      newNode.items = setDefaultsForNavigationTreeItems(node.items);
    }

    return newNode;
  });
}
