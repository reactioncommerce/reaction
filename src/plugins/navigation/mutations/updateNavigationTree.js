import ReactionError from "@reactioncommerce/reaction-error";
import decodeNavigationTreeItemIds from "../util/decodeNavigationTreeItemIds.js";
import setDefaultsForNavigationTreeItems from "../util/setDefaultsForNavigationTreeItems.js";
import { NavigationTree as NavigationTreeSchema } from "../simpleSchemas.js";

/**
 * @method updateNavigationTree
 * @summary Updates a navigation tree
 * @param {Object} context An object containing the per-request state
 * @param {String} _id _id of navigation tree to update
 * @param {Object} navigationTree Updated navigation tree
 * @returns {Promise<Object>} Updated navigation tree
 */
export default async function updateNavigationTree(context, _id, navigationTree) {
  const { collections, userHasPermission } = context;
  const { NavigationTrees } = collections;

  const shopId = await context.queries.primaryShopId(collections);
  const {
    shouldNavigationTreeItemsBeAdminOnly,
    shouldNavigationTreeItemsBePubliclyVisible,
    shouldNavigationTreeItemsBeSecondaryNavOnly
  } = await context.queries.appSettings(context, shopId);

  // Navigation item visibility defaults from settings
  const visibilityDefaults = {
    shouldNavigationTreeItemsBeAdminOnly,
    shouldNavigationTreeItemsBePubliclyVisible,
    shouldNavigationTreeItemsBeSecondaryNavOnly
  };

  // Set default values for navigation tree draft items before validation.
  // isVisible, isPrivate, and isSecondary are optional in the GraphQL schema,
  // but are required by SimpleSchema. This reduces the input payload size by not
  // needing to include values that aren't explicitly set.
  const navigationTreeData = {
    ...navigationTree,
    draftItems: setDefaultsForNavigationTreeItems(navigationTree.draftItems, visibilityDefaults)
  };

  // Validate the navigation tree with the defaults set
  NavigationTreeSchema.validate(navigationTreeData);
  const { draftItems, name } = navigationTreeData;

  if (userHasPermission(["core"], shopId) === false) {
    throw new ReactionError("access-denied", "You do not have permission to update a navigation tree");
  }

  const existingNavigationTree = await NavigationTrees.findOne({ _id });
  if (!existingNavigationTree) {
    throw new ReactionError("navigation-tree-not-found", "No navigation tree was found");
  }

  const update = {};

  if (draftItems) {
    decodeNavigationTreeItemIds(draftItems);
    update.draftItems = draftItems;
    update.hasUnpublishedChanges = true;
  }
  if (name) {
    update.name = name;
  }

  await NavigationTrees.updateOne({ _id }, { $set: { ...update } });

  const updatedNavigationTree = await NavigationTrees.findOne({ _id });

  return updatedNavigationTree;
}
