import ReactionError from "@reactioncommerce/reaction-error";
import { NavigationItemData } from "../simpleSchemas.js";

/**
 * @method updateNavigationItem
 * @summary Updates a navigation item
 * @param {Object} context An object containing the per-request state
 * @param {String} _id _id of navigation item to update
 * @param {Object} navigationItem Updated navigation item
 * @returns {Promise<Object>} Updated navigation item
 */
export default async function updateNavigationItem(context, _id, navigationItem) {
  const { collections, userHasPermission } = context;
  const { NavigationItems } = collections;
  const { draftData, metadata } = navigationItem;

  const shopId = await context.queries.primaryShopId(collections);

  if (userHasPermission(["core"], shopId) === false) {
    throw new ReactionError("access-denied", "You do not have permission to update a navigation item");
  }

  const existingNavigationItem = await NavigationItems.findOne({ _id });
  if (!existingNavigationItem) {
    throw new ReactionError("navigation-item-not-found", "Navigation item was not found");
  }

  const update = {};

  if (draftData) {
    NavigationItemData.validate(draftData);

    update.hasUnpublishedChanges = true;

    for (const fieldName in draftData) {
      if (Object.prototype.hasOwnProperty.call(draftData, fieldName)) {
        update[`draftData.${fieldName}`] = draftData[fieldName];
      }
    }
  }

  if (metadata) {
    try {
      update.metadata = JSON.parse(metadata);
    } catch (error) {
      throw new ReactionError("invalid-metadata-string", "Supplied metadata JSON string could not be parsed");
    }
  }

  await NavigationItems.updateOne({ _id }, { $set: { ...update } });

  const updatedNavigationItem = await NavigationItems.findOne({ _id });

  return updatedNavigationItem;
}
