import ReactionError from "@reactioncommerce/reaction-error";
import setDefaultsForNavigationTreeItems from "../util/setDefaultsForNavigationTreeItems.js";
import { NavigationTree as NavigationTreeSchema } from "../simpleSchemas.js";

/**
 * @method updateNavigationTree
 * @summary Updates a navigation tree
 * @param {Object} context An object containing the per-request state
 * @param {Object} input Input of updateNavigationTree mutation
 * @param {String} input.navigationTreeId ID of navigation tree to update
 * @param {String} input.shopId Shop ID of navigation tree
 * @param {Object} input.navigationTree Navigation tree object to update
 * @returns {Promise<Object>} Updated navigation tree
 */
export default async function updateNavigationTree(context, input) {
  const { collections } = context;
  const { NavigationTrees } = collections;
  const { navigationTreeId, shopId, navigationTree } = input;

  const treeSelector = { _id: navigationTreeId, shopId };
  const existingNavigationTree = await NavigationTrees.findOne(treeSelector);
  if (!existingNavigationTree) {
    throw new ReactionError("navigation-tree-not-found", "No navigation tree was found");
  }

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

  await context.validatePermissions(`reaction:legacy:navigationTrees:${navigationTreeId}`, "update", { shopId });

  const update = {};

  if (draftItems) {
    update.draftItems = draftItems;
    update.hasUnpublishedChanges = true;
  }
  if (name) {
    update.name = name;
  }

  await NavigationTrees.updateOne({ _id: navigationTreeId }, { $set: { ...update } });

  const updatedNavigationTree = await NavigationTrees.findOne(treeSelector);

  return updatedNavigationTree;
}
