import ReactionError from "@reactioncommerce/reaction-error";
import { NavigationTree as NavigationTreeSchema } from "/imports/collections/schemas";
import decodeNavigationTreeItemIds from "../util/decodeNavigationTreeItemIds";

/**
 * @method updateNavigationTree
 * @summary Updates a navigation tree
 * @param {Object} context An object containing the per-request state
 * @param {String} _id _id of navigation tree to update
 * @param {Object} navigationTree Updated navigation tree
 * @return {Promise<Object>} Updated navigation tree
 */
export default async function updateNavigationTree(context, _id, navigationTree) {
  const { collections, userHasPermission, shopId } = context;
  const { NavigationTrees } = collections;

  NavigationTreeSchema.validate(navigationTree);
  const { draftItems, name } = navigationTree;

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
