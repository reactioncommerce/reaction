import _ from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";
import getNavigationTreeItemIds from "../util/getNavigationTreeItemIds.js";

/**
 * @method publishNavigationChanges
 * @summary Publishes changes for a navigation tree and its items
 * @param {Object} context An object containing the per-request state
 * @param {String} input Input of publishNavigationChanges mutation
 * @param {String} input.navigationTreeId ID of navigation tree to publish
 * @param {String} input.shopId shopId of navigation tree to publish
 * @returns {Promise<Object>} Updated navigation tree
 */
export default async function publishNavigationChanges(context, input) {
  const { collections } = context;
  const { NavigationItems, NavigationTrees } = collections;
  const { navigationTreeId, shopId } = input;

  await context.validatePermissions("reaction:legacy:navigationTreeItems", "publish", { shopId });

  const treeSelector = { _id: navigationTreeId, shopId };
  const navigationTree = await NavigationTrees.findOne(treeSelector);
  if (!navigationTree) {
    throw new ReactionError("navigation-tree-not-found", "No navigation tree was found");
  }

  // Get the _ids of all items in the tree, recursively
  const { draftItems } = navigationTree;
  const draftItemIds = _.uniq(getNavigationTreeItemIds(draftItems));

  // Publish changes to all items in the tree
  draftItemIds.forEach(async (draftItemId) => {
    const itemSelector = { _id: draftItemId };
    const navigationItem = await NavigationItems.findOne(itemSelector);
    if (navigationItem) {
      const { draftData } = navigationItem;
      await NavigationItems.updateOne(itemSelector, {
        $set: {
          data: draftData,
          hasUnpublishedChanges: false
        }
      });
    }
  });

  // Publish changes to tree itself
  await NavigationTrees.updateOne(treeSelector, {
    $set: {
      items: draftItems,
      hasUnpublishedChanges: false
    }
  });

  return NavigationTrees.findOne(treeSelector);
}
