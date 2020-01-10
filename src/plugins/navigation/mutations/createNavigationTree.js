import ReactionError from "@reactioncommerce/reaction-error";
import Random from "@reactioncommerce/random";
import decodeNavigationTreeItemIds from "../util/decodeNavigationTreeItemIds.js";
import setDefaultsForNavigationTreeItems from "../util/setDefaultsForNavigationTreeItems.js";
import { NavigationTree as NavigationTreeSchema } from "../simpleSchemas.js";

/**
 * @method createNavigationTree
 * @summary Creates a navigation tree
 * @param {Object} context An object containing the per-request state
 * @param {Object} input Input of createNavigationTree mutation
 * @param {String} input.navigationTreeId ID of navigation tree to update
 * @param {String} input.shopId Shop ID of navigation tree
 * @param {Object} input.navigationTree Navigation tree object to update
 * @returns {Promise<Object>} Created navigation tree
 */
export default async function createNavigationTree(context, input) {
  const { collections } = context;
  const { NavigationTrees } = collections;
  const { navigationTreeId, shopId, navigationTree } = input;

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
    shopId,
    _id: Random.id(),
    draftItems: setDefaultsForNavigationTreeItems(navigationTree.draftItems, visibilityDefaults)
  };

  // Validate the navigation tree with the defaults set
  NavigationTreeSchema.validate(navigationTreeData);
  const { draftItems } = navigationTreeData;

  await context.validatePermissions(`reaction:navigationTrees:${navigationTreeId}`, "update", { shopId, legacyRoles: ["core"] });

  if (draftItems) {
    decodeNavigationTreeItemIds(draftItems);
    navigationTreeData.draftItems = draftItems;
    navigationTreeData.hasUnpublishedChanges = true;
  }

  await NavigationTrees.insertOne(navigationTreeData);

  return navigationTreeData;
}
