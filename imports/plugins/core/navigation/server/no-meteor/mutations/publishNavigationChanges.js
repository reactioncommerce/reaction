import SimpleSchema from "simpl-schema";
import { uniq } from "lodash";
import ReactionError from "@reactioncommerce/reaction-error";

function getNavigationTreeItemIds(items) {
  let itemIds = [];

  items.forEach((item) => {
    const { navigationItemId, items: childItems } = item;
    itemIds.push(navigationItemId);
    if (childItems) {
      const childItemIds = getNavigationTreeItemIds(childItems);
      itemIds = [...itemIds, ...childItemIds];
    }
  });

  return itemIds;
}

/**
 * @method publishNavigationChanges
 * @summary Publishes changes for a navigation tree and its items
 * @param {Object} context An object containing the per-request state
 * @param {String} _id _id of navigation tree to publish
 * @return {Promise<Object>} Updated navigation tree
 */
export default async function publishNavigationChanges(context, _id) {
  const { collections, userHasPermission, shopId } = context;
  const { NavigationItems, NavigationTrees } = collections;

  if (userHasPermission(["core"], shopId) === false) {
    throw new ReactionError("access-denied", "You do not have permission to publish a navigation tree");
  }

  const navigationTree = await NavigationTrees.findOne({ _id });
  if (!navigationTree) {
    throw new ReactionError("navigation-tree-not-found", "No navigation tree was found");
  }

  const { draftItems } = navigationTree;
  const draftItemIds = uniq(getNavigationTreeItemIds(draftItems));

  // Publish changes to all items in the tree
  draftItemIds.forEach(async (draftItemId) => {
    const selector = { _id: draftItemId };
    const navigationItem = await NavigationItems.findOne(selector);
    if (navigationItem) {
      const { draftData } = navigationItem;
      await NavigationItems.updateOne(selector, {
        $set: {
          data: draftData,
          hasUnpublishedChanges: false
        }
      });
    }
  });

  // Publish changes to tree itself
  await NavigationTrees.updateOne({ _id }, {
    $set: {
      items: draftItems,
      hasUnpublishedChanges: false
    }
  });

  return NavigationTrees.findOne({ _id });
}
