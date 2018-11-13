import SimpleSchema from "simpl-schema";
import Random from "@reactioncommerce/random";
import ReactionError from "@reactioncommerce/reaction-error";
import { NavigationItem as NavigationItemSchema } from "/imports/collections/schemas";

/**
 * @method updateNavigationItem
 * @summary Updates a navigation item
 * @param {Object} context An object containing the per-request state
 * @param {String} _id _id of navigation item to update
 * @param {Object} navigationItem Updated navigation item
 * @return {Promise<Object>} Object with `navigationItem` property containing the updated nav item
 */
export default async function updateNavigationItem(context, _id, navigationItem) {
  const { collections, userHasPermission, shopId } = context;
  const { NavigationItems } = collections;
  const { draftData, metadata } = navigationItem;

  if (userHasPermission(["core"], shopId) === false) {
    throw new ReactionError("access-denied", "You do not have permission to update a navigation item");
  }

  let update = {};

  if (draftData) {
    for (let fieldName in draftData) {
      update[`draftData.${fieldName}`] = draftData[fieldName];
    }
  }

  if (metadata) {
    try {
      update.metadata = JSON.parse(metadata);
    } catch(error) {
      throw new ReactionError("invalid-metadata-string", "Supplied metadata JSON string could not be parsed");
    }
  }

  NavigationItemSchema.validate(navigationItem);
  await NavigationItems.updateOne({ _id }, { $set: { ...update }});

  const updatedNavigationItem = await NavigationItems.findOne({ _id });

  return updatedNavigationItem;
}
