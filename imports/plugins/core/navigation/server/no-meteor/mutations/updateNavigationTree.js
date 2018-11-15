import SimpleSchema from "simpl-schema";
import ReactionError from "@reactioncommerce/reaction-error";
import { NavigationTree as NavigationTreeSchema } from "/imports/collections/schemas";

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
  const { draftItems, name } = navigationTree;

  if (userHasPermission(["core"], shopId) === false) {
    throw new ReactionError("access-denied", "You do not have permission to update a navigation tree");
  }

  const update = {};

  if (draftItems) {
    update.draftItems = draftItems;
    update.hasUnpublishedChanges = true;
  }
  if (name) {
    update.name = name;
  }

  NavigationTreeSchema.validate(navigationTree);
  await NavigationTrees.updateOne({ _id }, { $set: { ...update }});

  const updatedNavigationTree = await NavigationTrees.findOne({ _id });

  return updatedNavigationTree;
}
