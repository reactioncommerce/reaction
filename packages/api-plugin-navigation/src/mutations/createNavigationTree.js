import Random from "@reactioncommerce/random";
import setDefaultsForNavigationTreeItems from "../util/setDefaultsForNavigationTreeItems.js";
import { NavigationTree as NavigationTreeSchema } from "../simpleSchemas.js";

/**
 * @method createNavigationTree
 * @summary Creates a navigation tree
 * @param {Object} context An object containing the per-request state
 * @param {Object} input Input of createNavigationTree mutation
 * @param {String} input.name The name of the navigation tree to create
 * @param {String} input.shopId Shop ID of the navigation tree
 * @param {Object} input.draftItems The draft navigation items for the navigation tree to create
 * @returns {Promise<Object>} Created navigation tree
 */
export default async function createNavigationTree(context, input) {
  const { collections } = context;
  const { NavigationTrees } = collections;
  const { shopId } = input;

  await context.validatePermissions("reaction:legacy:navigationTrees", "create", { shopId });

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
    ...input,
    _id: Random.id()
  };

  if (navigationTreeData.draftItems) {
    navigationTreeData.draftItems = setDefaultsForNavigationTreeItems(input.draftItems, visibilityDefaults);
    navigationTreeData.hasUnpublishedChanges = true;
  }

  // Validate the navigation tree with the defaults set
  NavigationTreeSchema.validate(navigationTreeData);

  await NavigationTrees.insertOne(navigationTreeData);

  return navigationTreeData;
}
