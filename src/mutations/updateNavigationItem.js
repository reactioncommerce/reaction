import ReactionError from "@reactioncommerce/reaction-error";
import { NavigationItemData } from "../simpleSchemas.js";

/**
 * @method updateNavigationItem
 * @summary Updates a navigation item
 * @param {Object} context An object containing the per-request state
 * @param {Object} input Input of updateNavigationItem mutation
 * @param {String} input.navigationItemId ID of navigation item to update
 * @param {String} input.shopId Shop ID of navigation item
 * @param {String} input.navigationItem Navigation item object to update
 * @returns {Promise<Object>} Updated navigation item
 */
export default async function updateNavigationItem(context, input) {
  const { collections } = context;
  const { NavigationItems } = collections;
  const { navigationItemId, shopId, navigationItem } = input;
  const { draftData, metadata } = navigationItem;

  await context.validatePermissions(`reaction:legacy:navigationTreeItems:${navigationItemId}`, "update", { shopId });

  const existingNavigationItem = await NavigationItems.findOne({ _id: navigationItemId, shopId });
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

  await NavigationItems.updateOne({ _id: navigationItemId }, { $set: { ...update } });

  const updatedNavigationItem = await NavigationItems.findOne({ _id: navigationItemId });

  return updatedNavigationItem;
}
