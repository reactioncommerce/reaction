import ReactionError from "@reactioncommerce/reaction-error";
import SimpleSchema from "simpl-schema";

const DefaultValuesSchema = new SimpleSchema({
  shouldNavigationTreeItemsBeAdminOnly: {
    label: "shouldNavigationTreeItemsBeAdminOnly",
    type: Boolean
  },
  shouldNavigationTreeItemsBePubliclyVisible: {
    label: "shouldNavigationTreeItemsBePubliclyVisible",
    type: Boolean
  },
  shouldNavigationTreeItemsBeSecondaryNavOnly: {
    label: "shouldNavigationTreeItemsBeSecondaryNavOnly",
    type: Boolean
  }
});

/**
 * @name setDefaultsForNavigationTreeItems
 * @summary Recursively sets any optional values in the navigation tree with sane defaults
 * @param {Array} items Navigation tree items
 * @param {Object} defaultValues Navigation tree items default values. May be supplied from shop settings.
 * @param {Boolean} defaultValues.shouldNavigationTreeItemsBeAdminOnly Default value for `isPrivate`
 * @param {Boolean} defaultValues.shouldNavigationTreeItemsBePubliclyVisible Default value for `isVisible`
 * @param {Boolean} defaultValues.shouldNavigationTreeItemsBeSecondaryNavOnly Default value for `isSecondary`
 * @returns {Array} Navigation tree items
 */
export default function setDefaultsForNavigationTreeItems(items = [], defaultValues = {}) {
  if (typeof defaultValues !== "object") {
    throw new ReactionError("invalid-default-values", "Default values object is not defined.");
  }

  // Validate defaultValues. Throws if there's an issue
  DefaultValuesSchema.validate(defaultValues);

  const {
    shouldNavigationTreeItemsBeAdminOnly,
    shouldNavigationTreeItemsBePubliclyVisible,
    shouldNavigationTreeItemsBeSecondaryNavOnly
  } = defaultValues;

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
      isVisible: typeof isVisible === "boolean" ? isVisible : shouldNavigationTreeItemsBePubliclyVisible
    };

    // Check children recursively
    if (Array.isArray(node.items) && node.items.length) {
      newNode.items = setDefaultsForNavigationTreeItems(node.items, defaultValues);
    }

    return newNode;
  });
}
